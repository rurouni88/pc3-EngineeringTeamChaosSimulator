import type { GameState, Role } from './types';
import { ARCHETYPES, MODULE_DEFS, NAMES } from './data';
import { tickHour, endOfDayDevelopers } from './DeveloperEngine';
import { tickCodebase, spawnBug } from './CodebaseEngine';
import { makeTicket, tickTickets } from './TicketEngine';
import { chance, clamp, log, nextId, pick, rand, shuffle, slack, stability } from './util';
import { RngEngine } from './seeded-rng';

export const WORKING_HOURS = 8;
const QUARTER_DAYS = 30;
const AP_PER_DAY = 3;

// ---------- setup ----------

function makeEngineer(state: GameState, archetypeId: string) {
  const arch = ARCHETYPES.find((a) => a.id === archetypeId)!;
  return {
    id: nextId(state),
    name: pick(NAMES),
    archetypeId,
    skill: arch.skill,
    energy: arch.baseEnergy,
    morale: 70,
    burnout: 0,
    assignedTicketId: null as number | null,
    status: 'slacking' as const,
    lastAction: '',
  };
}

export function newGame(role: Role): GameState {
  const state: GameState = {
    day: 1,
    hour: 1,
    role,
    ap: AP_PER_DAY,
    budget: 800,
    guidelinesEnforced: false,
    okrActive: role === 'CIO',
    engineers: [],
    tickets: [],
    modules: MODULE_DEFS.map((m) => ({ ...m })),
    slack: [],
    log: [],
    gameOver: null,
    nextId: 1,
    stats: { shipped: 0, fired: 0, mediated: 0, interruptions: 0 },
  };

  const arches = shuffle(ARCHETYPES).slice(0, 3);
  for (const a of arches) state.engineers.push(makeEngineer(state, a.id));

  for (let i = 0; i < 2; i++) state.tickets.push(makeTicket(state, 'bug'));
  for (let i = 0; i < 3; i++) state.tickets.push(makeTicket(state, 'feature'));
  state.tickets.push(makeTicket(state, 'epic'));

  log(state, `☀️ Day 1. You are the ${role}. The system is alive. For now.`, 'info');
  slack(state, '#announcements', 'you', `hey team, I'm the new ${role}. let's ship.`);
  return state;
}

// ---------- the tick ----------

function pmInterruption(state: GameState) {
  const working = state.engineers
    .map((e) => ({ e, t: state.tickets.find((t) => t.id === e.assignedTicketId && !t.done) }))
    .filter((entry) => entry.t);
  if (working.length === 0 || !chance(0.02)) return;

  const { e, t } = pick(working);
  if (!t) return;
  state.stats.interruptions++;
  const wiped = Math.round(t.progress * rand(0.2, 0.4));
  t.progress = Math.max(0, t.progress - wiped);
  e.burnout = clamp(e.burnout + 10, 0, 100);
  e.morale = clamp(e.morale - 8, 0, 100);
  slack(
    state,
    '#dev-team',
    'Product Manager (NPC)',
    `hey ${e.name}! quick one: can we just make the button purple? it's a 5 min change 🙏`,
  );
  log(
    state,
    `📢 PM interruption: ${e.name} lost ${wiped} pts on "${t.title}"`,
    'chaos',
  );

}

function randomEvent(state: GameState) {
  if (!chance(0.4)) return;
  const roll = RngEngine.random();
  if (roll < 0.2) {
    const m = pick(state.modules);
    m.health = clamp(m.health - 10, 0, 100);
    m.debt = clamp(m.debt + 10, 0, 100);
    log(state, `📦 Breaking dependency release wrecks ${m.name}`, 'bad');
  } else if (roll < 0.4) {
    for (const e of state.engineers) e.morale = clamp(e.morale + 10, 0, 100);
    slack(state, '#announcements', 'CEO', 'proud of this team. doubling the pizza budget.');
    log(state, '📣 CEO tweets about the product. Morale +10 across the team', 'good');
  } else if (roll < 0.6) {
    const e = pick(state.engineers);
    e.energy = clamp(e.energy - 25, 0, 100);
    spawnBug(state, pick(state.modules).id, 'oncall-bot', 2);
    log(state, `🌙 3am on-call page. ${e.name} was the one who got it`, 'bad');
  } else if (roll < 0.8) {
    const active = state.tickets.filter((t) => t.stage === 'inprogress');
    for (const e of state.engineers) {
      e.morale = clamp(e.morale + 10, 0, 100);
      e.energy = clamp(e.energy - 10, 0, 100);
    }
    if (active.length) active[0].progress += 15;
    log(state, '🎉 Hackathon! Morale up, a ticket got a free boost', 'good');
  } else if (roll < 0.9) {
    for (const m of state.modules) m.debt = clamp(m.debt + 10, 0, 100);
    log(state, '📋 Compliance audit: every module gains tech debt', 'bad');
  } else {
    state.budget -= 50;
    log(state, '🏁 Competitor launches a similar product. Budget -$50k', 'bad');
  }
}

function endOfDay(state: GameState) {
  endOfDayDevelopers(state);
  tickTickets(state);
  tickCodebase(state);
  state.budget -= 10 + state.engineers.length * 5; // salaries

  // the business never stops asking for things (but the backlog has a ceiling)
  if (chance(0.35) && state.tickets.length < 8) {
    const roll = RngEngine.random();
    const t = makeTicket(
      state,
      roll < 0.6 ? 'feature' : roll < 0.9 ? 'bug' : 'epic',
    );
    state.tickets.push(t);
    log(state, `📥 New ticket from the business: "${t.title}"`, 'info');
  }

  randomEvent(state);

  state.day += 1;
  state.hour = 1;
  state.ap = AP_PER_DAY;

  const stab = stability(state);
  if (stab <= 10) {
    state.gameOver = 'collapse';
    log(state, '💀 The system has collapsed. The war room is a real room now.', 'chaos');
  } else if (state.budget <= 0) {
    state.gameOver = 'bankrupt';
    log(state, '🏦 The budget is gone. The lawyers are already in the lobby.', 'chaos');
  } else if (state.day > QUARTER_DAYS) {
    if (stab >= 50) {
      state.gameOver = 'win';
      log(state, `🏆 Quarter survived with ${stab}% stability. Legendary.`, 'good');
    } else {
      state.gameOver = 'collapse';
      log(state, `💀 Quarter ended, but the system is a ${stab}% wreck. The board is not impressed.`, 'chaos');
    }
  }
}

/** Pure game tick: one working hour. Safe for setState updaters. */
export function runGameTick(current: GameState): GameState {
  if (current.gameOver) return current;
  const state = structuredClone(current);
  state.hour += 1;
  tickHour(state);
  pmInterruption(state);
  if (state.hour >= WORKING_HOURS) endOfDay(state);
  return state;
}

/** Fast-forward the rest of the day. */
export function skipToEOD(current: GameState): GameState {
  let state = current;
  let guard = 0;
  while (!state.gameOver && state.hour < WORKING_HOURS && guard++ < 100) {
    state = runGameTick(state);
  }
  return state;
}

// ---------- player actions ----------

function spendAp(state: GameState): boolean {
  if (state.ap <= 0 || state.gameOver) return false;
  state.ap -= 1;
  return true;
}

export const actions = {
  assign(state: GameState, ticketId: number, engineerId: number | null) {
    const next = structuredClone(state);
    for (const e of next.engineers) {
      if (e.assignedTicketId === ticketId) e.assignedTicketId = null;
    }
    if (engineerId !== null) {
      const e = next.engineers.find((x) => x.id === engineerId);
      if (e) e.assignedTicketId = ticketId;
    }
    return next;
  },

  writeSpec(state: GameState, ticketId: number) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const t = next.tickets.find((x) => x.id === ticketId);
    if (!t) return state;
    t.specClarity = clamp(t.specClarity + 40, 0, 100);
    log(next, `📝 You wrote a precise spec for "${t.title}" (clarity ${t.specClarity}%)`, 'good');
    return next;
  },

  addTicket(state: GameState) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const t = makeTicket(next, 'feature');
    next.tickets.push(t);
    log(next, `🎫 New ticket in the backlog: "${t.title}"`, 'info');
    return next;
  },

  cutScope(state: GameState, ticketId: number) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const t = next.tickets.find((x) => x.id === ticketId);
    if (!t) return state;
    next.tickets = next.tickets.filter((x) => x.id !== ticketId);
    const e = next.engineers.find((x) => x.assignedTicketId === ticketId);
    if (e) {
      e.assignedTicketId = null;
      e.morale = clamp(e.morale - 5, 0, 100);
    }
    log(next, `✂️ You cut "${t.title}" from scope. Someone is quietly furious.`, 'info');
    return next;
  },

  mediate(state: GameState, ticketId: number) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const t = next.tickets.find((x) => x.id === ticketId);
    if (!t || !t.stuckInReview) return state;
    t.stuckInReview = false;
    next.stats.mediated++;
    log(next, `🕊️ You mediated the code review war over "${t.title}". Everyone pretends it never happened.`, 'good');
    slack(next, '#dev-team', 'you', 'everyone is taking a 10 minute walk. the PR is merging after.');
    return next;
  },

  oneOnOne(state: GameState, engineerId: number) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const e = next.engineers.find((x) => x.id === engineerId);
    if (!e) return state;
    e.morale = clamp(e.morale + 20, 0, 100);
    e.energy = clamp(e.energy + 10, 0, 100);
    e.burnout = clamp(e.burnout - 10, 0, 100);
    log(next, `🫖 1:1 with ${e.name}. They felt heard. Mostly.`, 'good');
    return next;
  },

  codeReview(state: GameState, ticketId: number) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const t = next.tickets.find((x) => x.id === ticketId);
    if (!t) return state;
    const m = next.modules.find((x) => x.id === t.moduleId);
    if (m) m.debt = clamp(m.debt - 10, 0, 100);
    t.progress += 5;
    log(next, `🧐 Your hands-on code review of "${t.title}" shaved some debt off ${m?.name ?? 'the module'}`, 'good');
    return next;
  },

  toggleGuidelines(state: GameState) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    next.guidelinesEnforced = !next.guidelinesEnforced;
    log(
      next,
      next.guidelinesEnforced
        ? '📐 Architectural guidelines ENFORCED. Debt will decay. The egos will chafe.'
        : '📐 Architectural guidelines relaxed. Freedom! Also entropy.',
      'info',
    );
    return next;
  },

  hire(state: GameState) {
    const next = structuredClone(state);
    if (!spendAp(next) || next.budget < 100) return state;
    next.budget -= 100;
    const a = pick(ARCHETYPES);
    next.engineers.push(makeEngineer(next, a.id));
    log(next, `🤝 Hired ${next.engineers[next.engineers.length - 1].name} — ${a.name} ($100k)`, 'good');
    slack(next, '#random', next.engineers[next.engineers.length - 1].name, 'hey! just joined. where is the wifi password');
    return next;
  },

  fire(state: GameState, engineerId: number) {
    const next = structuredClone(state);
    if (!spendAp(next)) return state;
    const e = next.engineers.find((x) => x.id === engineerId);
    if (!e) return state;
    next.stats.fired++;
    next.engineers = next.engineers.filter((x) => x.id !== engineerId);
    for (const other of next.engineers) other.morale = clamp(other.morale - 10, 0, 100);
    log(next, `🪓 You fired ${e.name}. The remaining team is quietly updating their CVs.`, 'bad');
    slack(next, '#random', '??', 'why is the standup so quiet today');
    return next;
  },

  investInfra(state: GameState) {
    const next = structuredClone(state);
    if (!spendAp(next) || next.budget < 80) return state;
    next.budget -= 80;
    for (const m of next.modules) {
      m.health = clamp(m.health + 10, 0, 100);
      m.debt = clamp(m.debt - 10, 0, 100);
    }
    log(next, '🏗️ You invested $80k in infrastructure. Every module feels it.', 'good');
    return next;
  },
};
