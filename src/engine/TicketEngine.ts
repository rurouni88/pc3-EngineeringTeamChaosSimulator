import type { GameState, Ticket, TicketType } from './types';
import { TICKET_TEMPLATES } from './data';
import { avgDebt, chance, clamp, log, moduleById, nextId, pick, rand, slack, shuffle } from './util';

const COWBOYS = ['rockstar', 'framework', 'grindset'];
const PERFECTIONISTS = ['zealot', 'architect', 'zen'];

/** Code Review Trap: cowboy reviews perfectionist's MR -> flame war, ticket stalls. */
function triggerReviewTrap(state: GameState, t: Ticket) {
  const author = state.engineers.find((e) => e.assignedTicketId === t.id);
  const reviewers = state.engineers.filter(
    (e) => e.id !== author?.id && e.status !== 'on-leave',
  );
  if (!author || reviewers.length === 0) return;
  const reviewer = pick(reviewers);
  const isTrap =
    COWBOYS.includes(reviewer.archetypeId) &&
    PERFECTIONISTS.includes(author.archetypeId);
  if (!isTrap || !chance(0.4)) return;

  t.stuckInReview = true;
  reviewer.burnout = clamp(reviewer.burnout + 15, 0, 100);
  author.burnout = clamp(author.burnout + 15, 0, 100);
  reviewer.morale = clamp(reviewer.morale - 10, 0, 100);
  author.morale = clamp(author.morale - 10, 0, 100);
  reviewer.status = 'arguing';
  log(
    state,
    `⚔️ Code review war: ${reviewer.name} vs ${author.name} over "${t.title}"`,
    'chaos',
  );
  slack(state, '#dev-team', reviewer.name, 'this PR is a crime against humanity. revert it.');
  slack(state, '#dev-team', author.name, 'I will not touch a single line. it is correct.');
  slack(state, '#dev-team', reviewer.name, 'I am putting my resignation in the PR description. metaphorically.');
}

export function makeTicket(state: GameState, type?: TicketType): Ticket {
  const tType: TicketType = type ?? pick<TicketType>(['feature', 'bug', 'epic']);
  const usedTitles = new Set(state.tickets.map((t) => t.title));
  const available = TICKET_TEMPLATES[tType].filter((t) => !usedTitles.has(t.title));
  const pool = available.length > 0 ? available : TICKET_TEMPLATES[tType];
  const tpl = pick(shuffle(pool));
  return {
    id: nextId(state),
    title: tpl.title,
    type: tType,
    moduleId: tpl.moduleId,
    effort: tpl.effort,
    progress: 0,
    specClarity: Math.round(rand(20, 70)),
    stage: 'backlog',
    stuckInReview: false,
    deadline: state.day + (tType === 'bug' ? 5 : tType === 'epic' ? 12 : 8),
    reward:
      tType === 'bug'
        ? { stability: Math.round(rand(12, 20)), revenue: Math.round(rand(0, 10)) }
        : tType === 'feature'
          ? { stability: 8, revenue: Math.round(rand(40, 80)) }
          : { stability: 20, revenue: Math.round(rand(80, 150)) },
    done: false,
  };
}

/** End-of-day: move tickets through In Progress -> QA -> Production. */
export function tickTickets(state: GameState) {
  for (const t of state.tickets) {
    if (t.done) continue;

    if (t.stage === 'inprogress' && t.progress >= t.effort) {
      t.stage = 'qa';
      log(state, `🔍 ${t.title} moved to QA`, 'info');
      triggerReviewTrap(state, t);
    } else if (t.stage === 'qa' && t.stuckInReview) {
      // limbo: nothing moves until the player mediates
    } else if (t.stage === 'qa') {
      const passP = 0.5 + t.specClarity / 200 - avgDebt(state) / 250;
      if (chance(passP)) {
        t.stage = 'production';
        log(state, `✅ ${t.title} passed QA`, 'good');
      } else {
        t.stage = 'inprogress';
        t.progress = Math.max(0, t.progress - 10);
        log(state, `🔁 ${t.title} failed QA — regression found`, 'bad');
      }
    } else if (t.stage === 'production') {
      const m = moduleById(state, t.moduleId);
      if (m) m.health = clamp(m.health + t.reward.stability, 0, 100);
      state.budget += t.reward.revenue;
      t.done = true;
      state.stats.shipped++;
      log(
        state,
        `🚀 ${t.title} shipped (+${t.reward.stability} stability, +$${t.reward.revenue}k)`,
        'good',
      );
      slack(state, '#announcements', 'deploy-bot', `🚀 ${t.title} is live in production`);
      const eng = state.engineers.find((e) => e.assignedTicketId === t.id);
      if (eng) {
        eng.assignedTicketId = null;
        eng.morale = clamp(eng.morale + 8, 0, 100);
      }
    }

    // overdue tickets rot the module and the team
    if (!t.done && t.deadline < state.day) {
      const m = moduleById(state, t.moduleId);
      if (m) m.health = clamp(m.health - 1, 0, 100);
      const eng = state.engineers.find((e) => e.assignedTicketId === t.id);
      if (eng) eng.morale = clamp(eng.morale - 2, 0, 100);
      if (chance(0.2)) {
        log(state, `⏰ ${t.title} is overdue and festering`, 'bad');
      }
    }
  }

  // shipped tickets leave the board
  state.tickets = state.tickets.filter((t) => !t.done);
}
