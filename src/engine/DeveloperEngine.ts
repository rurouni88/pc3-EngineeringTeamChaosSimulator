import type { Archetype, Engineer, GameState, Ticket } from './types';
import { ARCHETYPE_MAP, TEAM_IDLE } from './data';
import { generateDevActionText } from './flavor';
import { spawnBug } from './CodebaseEngine';
import { avgDebt, chance, clamp, log, pick, rand, teamMessage } from './util';

function applyQuirk(state: GameState, eng: Engineer, arch: Archetype, ticket: Ticket) {
  switch (arch.id) {
    case 'rockstar':
      ticket.progress += 8;
      {
        const m = state.modules.find((mod) => mod.id === ticket.moduleId)!;
        m.debt = clamp(m.debt + 12, 0, 100);
        teamMessage(state, '#dev-team', eng.name, `I rewrote ${m.name} in a new language. Behold.`);
      }
      break;
    case 'grindset':
      eng.energy = clamp(eng.energy - 12, 0, 100);
      teamMessage(state, '#dev-team', eng.name, 'still typing. it is 2am. I am the pipeline now.');
      break;
    case 'architect':
      {
        const m = state.modules.find((mod) => mod.id === ticket.moduleId)!;
        m.debt = clamp(m.debt + 10, 0, 100);
        m.health = clamp(m.health - 4, 0, 100);
        teamMessage(state, '#dev-team', eng.name, `added a microservice to ${m.name}. it needed it.`);
      }
      break;
    case 'zen':
      teamMessage(state, '#random', eng.name, 'I have declined this urgency. It is declining me back.');
      break;
    case 'imposter':
      ticket.progress = Math.max(0, ticket.progress - 10);
      teamMessage(state, '#incidents', eng.name, 'I deleted 400 lines to "clean up". I do not know what they were.');
      log(state, `😱 ${eng.name} deleted code out of pure panic`, 'chaos');
      break;
    case 'slackwiz':
      if (chance(0.5)) {
        ticket.progress *= 2;
        teamMessage(state, '#dev-team', eng.name, 'shipped it. you are welcome. back to my podcast.');
      }
      break;
    case 'framework':
      {
        const m = state.modules.find((mod) => mod.id === ticket.moduleId)!;
        m.debt = clamp(m.debt + 15, 0, 100);
        ticket.progress = Math.max(0, ticket.progress - 3);
        teamMessage(state, '#dev-team', eng.name, `starting the framework migration in ${m.name}. no objections? great.`);
      }
      break;
    case 'zealot':
      {
        const m = state.modules.find((mod) => mod.id === ticket.moduleId)!;
        m.debt = clamp(m.debt - 10, 0, 100);
        ticket.progress = Math.max(0, ticket.progress - 3);
        teamMessage(state, '#dev-team', eng.name, `wrote 200 tests for ${m.name}. the feature is next sprint. forever.`);
      }
      break;
    case 'intern':
      if (chance(0.5)) {
        const mentor = pick(state.engineers.filter((e) => e.id !== eng.id));
        if (mentor) mentor.morale = clamp(mentor.morale + 5, 0, 100);
        ticket.progress += 3;
        teamMessage(state, '#dev-team', eng.name, 'quick question: is this the file? (it is not. it is never the file.)');
      } else {
        teamMessage(state, '#incidents', eng.name, 'I broke staging. I can fix it. probably.');
      }
      break;
    case 'vendor':
      state.budget -= 15;
      ticket.progress += 10;
      teamMessage(state, '#dev-team', eng.name, 'delivered ahead of schedule! (see attached invoice. net-15.)');
      log(state, `💍 ${eng.name} upsold the team. -$15k, but the work got done`, 'info');
      break;
    case 'security':
      {
        const m = state.modules.find((mod) => mod.id === ticket.moduleId)!;
        m.health = clamp(m.health + 8, 0, 100);
        ticket.progress = Math.max(0, ticket.progress - 5);
        teamMessage(state, '#dev-team', eng.name, `blocked the deploy. 3 findings. 1 is cultural.`);
      }
      break;
    case 'devrel':
      state.budget += 25;
      for (const e of state.engineers) e.morale = clamp(e.morale + 5, 0, 100);
      teamMessage(state, '#announcements', eng.name, 'just closed a keynote slot! the demo will be real. eventually.');
      log(state, `🎤 ${eng.name} landed a conference slot. +$25k, morale up`, 'good');
      break;
  }
}

/** Per-hour micro simulation: small progress, flavor text, rare chaos. */
export function tickHour(state: GameState) {
  const debt = avgDebt(state);

  for (const eng of state.engineers) {
    if (eng.status === 'on-leave') continue;
    const arch = ARCHETYPE_MAP[eng.archetypeId];
    const ticket = state.tickets.find(
      (t) => t.id === eng.assignedTicketId && !t.done,
    );

    if (ticket) {
      if (ticket.stage === 'backlog') ticket.stage = 'inprogress';

      let progress =
        ((eng.skill / 10) *
          10 *
          (eng.energy / 100) *
          (0.4 + ticket.specClarity / 100) *
          arch.workMod *
          (eng.morale < 30 ? 0.6 : 1) *
          (state.guidelinesEnforced && arch.ego >= 7 ? 0.9 : 1) *
          (debt > 60 ? 0.8 : 1) *
          (state.okrActive ? 1.25 : 1) * 2) /
        8;
      progress *= rand(0.7, 1.3);
      ticket.progress = Math.max(0, ticket.progress + progress);
      eng.status = 'working';

      if (chance(0.35)) {
        eng.lastAction = generateDevActionText(arch.id, eng.burnout, eng.name, 'work');
      }
      if (chance(arch.bugChance / 8)) spawnBug(state, ticket.moduleId, eng.name);
      if (chance(arch.quirkChance / 8)) applyQuirk(state, eng, arch, ticket);

      // Spaghetti cascade: pushing into a high-debt module can break neighbors
      const m = state.modules.find((mod) => mod.id === ticket.moduleId);
      if (m && m.debt > 60 && chance((m.debt / 100) * 0.08)) {
        const victim = pick(state.modules.filter((x) => x.id !== m.id));
        const dmg = Math.round(5 + rand(0, 10));
        victim.health = clamp(victim.health - dmg, 0, 100);
        victim.debt = clamp(victim.debt + 5, 0, 100);
        log(
          state,
          `🍝 Spaghetti cascade: ${eng.name}'s push in ${m.name} broke ${victim.name} (-${dmg})`,
          'chaos',
        );
        teamMessage(
          state,
          '#incidents',
          eng.name,
          `I only touched ${m.name}. why is ${victim.name} on fire`,
        );
      }
    } else {
      eng.status = 'slacking';
      if (chance(0.12)) {
        eng.lastAction = `[SLACK] **${eng.name}**: ${pick(TEAM_IDLE)}`;
      }
    }
  }
}

/** End-of-day: energy, burnout, morale, forced leave, arguments. */
export function endOfDayDevelopers(state: GameState) {
  for (const eng of state.engineers) {
    const arch = ARCHETYPE_MAP[eng.archetypeId];

    if (eng.burnout >= 100) {
      eng.status = 'on-leave';
      eng.energy = clamp(eng.energy + 25, 0, 100);
      eng.burnout = clamp(eng.burnout - 30, 0, 100);
      eng.lastAction = `[SLACK] **${eng.name}**: I am out. the calendar blocks itself.`;
      log(state, `🏖️ ${eng.name} is burned out and on forced leave`, 'bad');
      continue;
    }

    if (eng.status === 'working') {
      eng.energy = clamp(eng.energy - 9, 0, 100);
      const fatigue = eng.energy < 30 ? 3 : 0;
      eng.burnout = clamp(
        eng.burnout + (arch.id === 'grindset' ? 8 : 5) + fatigue,
        0,
        100,
      );
      if (state.guidelinesEnforced && arch.ego >= 7) {
        eng.morale = clamp(eng.morale - 3, 0, 100);
      }
    } else {
      eng.energy = clamp(eng.energy + 22, 0, 100);
      eng.morale = clamp(eng.morale + 4, 0, 100);
      eng.burnout = clamp(eng.burnout - 12, 0, 100);
    }
    // everyone sleeps, eventually
    eng.energy = clamp(eng.energy + 5, 0, 100);
  }

  // arguments: two high-ego or miserable engineers clash
  const candidates = state.engineers.filter(
    (e) =>
      e.status !== 'on-leave' &&
      (ARCHETYPE_MAP[e.archetypeId].ego >= 7 || e.morale < 35),
  );
  if (candidates.length >= 2 && chance(0.3)) {
    const a = pick(candidates);
    const b = pick(candidates.filter((e) => e.id !== a.id));
    a.status = 'arguing';
    b.status = 'arguing';
    a.morale = clamp(a.morale - 5, 0, 100);
    b.morale = clamp(b.morale - 5, 0, 100);
    log(state, `⚔️ ${a.name} and ${b.name} are arguing in #dev-team`, 'chaos');
    teamMessage(state, '#dev-team', a.name, 'we need to talk about the architecture. again.');
    teamMessage(state, '#dev-team', b.name, 'I will not be reviewing another 4k-line diff.');
  }
}
