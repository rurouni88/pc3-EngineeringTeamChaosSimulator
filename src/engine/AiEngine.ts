// AiEngine — AI tools, actions, and consequences.
// AI is a tool that helps but creates new problems. Overreliance debuffs the team.

import type { GameState } from './types';
import { pick, chance, clamp, log, moduleById, nextId, teamMessage, shuffle } from './util';
import { generateAiActionText } from './flavor';

export interface AiState {
  usageCount: number;
  overreliance: number; // 0-100
  lastAiAction: string | null;
}

const DEFAULT_AI_STATE: AiState = {
  usageCount: 0,
  overreliance: 0,
  lastAiAction: null,
};

/** Apply overreliance debuffs when AI usage is too high. */
export function applyOverreliance(state: GameState): void {
  const ai = state.ai;
  if (ai.overreliance > 70) {
    // Team stops thinking — progress slows
    for (const t of state.tickets) {
      if (t.stage === 'inprogress' && !t.done) {
        t.progress = Math.max(0, t.progress - 2);
      }
    }
    if (chance(0.3)) {
      log(state, '🤖 Team has stopped thinking. AI did it, so they don\'t have to.', 'chaos');
    }
  } else if (ai.overreliance > 40) {
    // Mild overreliance — occasional bugs
    if (chance(0.15)) {
      const m = pick(state.modules);
      m.debt = clamp(m.debt + 5, 0, 100);
      log(state, `🤖 AI-generated code in ${m.name} adds tech debt`, 'bad');
    }
  }
}

/** Decay overreliance when AI isn't used for a while. */
export function decayOverreliance(state: GameState): void {
  state.ai.overreliance = clamp(state.ai.overreliance - 3, 0, 100);
}

// ---------- PO AI Actions ----------

export function aiGenerateSpec(state: GameState, ticketId: number): GameState {
  const next = structuredClone(state);
  const t = next.tickets.find((x) => x.id === ticketId);
  if (!t) return state;

  next.ai.usageCount++;
  next.ai.lastAiAction = 'generateSpec';

  // AI writes spec — adds clarity but also hallucination
  const clarityGain = Math.round(20 + Math.random() * 30);
  const hallucination = chance(0.4);

  t.specClarity = clamp(t.specClarity + clarityGain, 0, 100);
  next.ai.overreliance = clamp(next.ai.overreliance + 5, 0, 100);

  if (hallucination) {
    // AI hallucinates requirements — adds confusion
    const extraEffort = Math.round(5 + Math.random() * 10);
    t.effort += extraEffort;
    log(next, `🤖 AI generated spec for "${t.title}" (+${clarityGain}% clarity, but +${extraEffort} effort from hallucinated requirements)`, 'chaos');
  } else {
    log(next, `🤖 AI generated spec for "${t.title}" (+${clarityGain}% clarity)`, 'good');
  }

  teamMessage(next, '#dev-team', 'ai-assistant', generateAiActionText('spec'));

  return next;
}

export function aiAddTicket(state: GameState): GameState {
  const next = structuredClone(state);
  if (next.tickets.length >= 12) return state; // Cap backlog

  next.ai.usageCount++;
  next.ai.lastAiAction = 'addTicket';
  next.ai.overreliance = clamp(next.ai.overreliance + 3, 0, 100);

  // AI generates ticket from vague description
  const titles = [
    'AI-generated feature (requirements TBD)',
    'AI suggests we add dark mode (again)',
    'AI thinks users want blockchain',
    'AI-generated "quick win" (it isn\'t quick)',
    'AI recommended this based on metrics (metrics are wrong)',
  ];
  const title = pick(titles);
  const module = pick(next.modules);

  const ticket = {
    id: nextId(next),
    title,
    type: 'feature' as const,
    moduleId: module.id,
    effort: Math.round(10 + Math.random() * 20),
    progress: 0,
    specClarity: Math.round(10 + Math.random() * 20), // Low clarity
    stage: 'backlog' as const,
    stuckInReview: false,
    deadline: next.day + 8,
    reward: { stability: 5, revenue: Math.round(20 + Math.random() * 40) },
    done: false,
  };

  next.tickets.push(ticket);
  log(next, `🤖 AI added ticket: "${title}"`, 'info');
  teamMessage(next, '#announcements', 'ai-assistant', `I analyzed the backlog and found a "quick win": ${title}`);

  return next;
}

// ---------- EM AI Actions ----------

export function aiCodeReview(state: GameState, ticketId: number): GameState {
  const next = structuredClone(state);
  const t = next.tickets.find((x) => x.id === ticketId);
  if (!t) return state;

  next.ai.usageCount++;
  next.ai.lastAiAction = 'codeReview';
  next.ai.overreliance = clamp(next.ai.overreliance + 4, 0, 100);

  // AI reviews code — may miss bugs
  const missedBug = chance(0.35);
  const progressGain = 5 + Math.round(Math.random() * 10);
  t.progress += progressGain;

  if (missedBug) {
    const m = moduleById(next, t.moduleId);
    if (m) {
      m.debt = clamp(m.debt + 8, 0, 100);
      log(next, `🤖 AI reviewed "${t.title}" — approved it, but missed a bug (+${progressGain} progress, +8 debt)`, 'chaos');
    }
  } else {
    log(next, `🤖 AI reviewed "${t.title}" and approved it (+${progressGain} progress)`, 'good');
  }

  teamMessage(next, '#dev-team', 'ai-assistant', generateAiActionText('review'));

  return next;
}

export function aiMediate(state: GameState, ticketId: number): GameState {
  const next = structuredClone(state);
  const t = next.tickets.find((x) => x.id === ticketId);
  if (!t || !t.stuckInReview) return state;

  next.ai.usageCount++;
  next.ai.lastAiAction = 'mediate';
  next.ai.overreliance = clamp(next.ai.overreliance + 3, 0, 100);

  // AI mediates — suggests compromise that angers both sides
  t.stuckInReview = false;
  next.stats.mediated++;

  const engineers = next.engineers.filter((e) => e.assignedTicketId === ticketId || e.status === 'arguing');
  for (const e of engineers) {
    e.morale = clamp(e.morale - 5, 0, 100);
    e.burnout = clamp(e.burnout + 5, 0, 100);
  }

  log(next, `🤖 AI mediated the review war over "${t.title}" — compromise satisfied no one`, 'chaos');
  teamMessage(next, '#dev-team', 'ai-assistant', 'I have analyzed both sides and determined that both of you are partially correct and partially wrong. This is not satisfying either of you.');

  return next;
}

// ---------- CIO AI Actions ----------

export function aiHire(state: GameState): GameState {
  const next = structuredClone(state);
  if (next.budget < 50) return state; // Cheaper than humans

  next.ai.usageCount++;
  next.ai.lastAiAction = 'hire';
  next.ai.overreliance = clamp(next.ai.overreliance + 8, 0, 100);

  next.budget -= 50;

  // AI engineer — fast but causes existential dread
  const names = ['GPT-4', 'Claude', 'Gemini', 'Llama', 'Mistral', 'Copilot', 'Codex', 'Devin'];
  const name = pick(names);

  log(next, `🤖 Hired ${name} AI Engineer ($50k). It works fast. The team is uneasy.`, 'info');
  teamMessage(next, '#random', name, 'hello! i am ready to contribute. please assign me tickets. i will not sleep. i do not need to.');

  return next;
}

export function aiInvest(state: GameState): GameState {
  const next = structuredClone(state);
  if (next.budget < 100) return state;

  next.ai.usageCount++;
  next.ai.lastAiAction = 'invest';
  next.ai.overreliance = clamp(next.ai.overreliance + 6, 0, 100);

  next.budget -= 100;

  // AI tooling — helps initially but creates dependency
  for (const m of next.modules) {
    m.debt = clamp(m.debt - 10, 0, 100);
  }

  log(next, '🤖 Invested $100k in AI tooling. Debt decreased. Now we need the AI tooling to fix things.', 'good');
  teamMessage(next, '#announcements', 'ai-assistant', 'I have integrated AI into your CI/CD pipeline. Your builds are 40% faster and 200% more confusing.');

  return next;
}

// ---------- AI Random Events ----------

export function aiEvent(state: GameState): void {
  if (state.ai.usageCount < 3) return; // Need some AI usage first
  if (!chance(0.15)) return; // 15% chance per day

  const events = [
    () => {
      // AI hallucinates requirements
      const title = pick([
        'AI hallucinated a requirement',
        'AI thinks we need Kubernetes',
        'AI suggested we rewrite in Rust',
        'AI generated a "simple" feature (it isn\'t simple)',
      ]);
      log(state, `🤖 ${title}`, 'chaos');
      teamMessage(state, '#incidents', 'ai-assistant', 'I have identified a critical requirement that we are missing: ' + title);
    },
    () => {
      // AI meeting notes
      const notes = pick([
        'AI generated meeting notes that contradict what was actually decided',
        'AI sent calendar invites for meetings that don\'t exist',
        'AI summarized the standup as "everyone agreed to do more"',
      ]);
      log(state, `🤖 ${notes}`, 'info');
    },
    () => {
      // AI code breaks something
      const m = pick(state.modules);
      const dmg = Math.round(5 + Math.random() * 10);
      m.health = clamp(m.health - dmg, 0, 100);
      log(state, `🤖 AI-generated code in ${m.name} broke something (-${dmg} health)`, 'bad');
      teamMessage(state, '#incidents', 'ai-assistant', 'I may have introduced a regression while optimizing. It is a feature, not a bug.');
    },
    () => {
      // AI overconfidence
      if (state.ai.overreliance > 50) {
        log(state, '🤖 AI is overconfident. It approved a deploy without checking.', 'chaos');
        teamMessage(state, '#dev-team', 'ai-assistant', 'I have deployed to production. Everything is fine. Trust me.');
      }
    },
  ];

  const event = pick(events);
  event();
}
