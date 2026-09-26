import type { GameState } from './types';
import { TEAM_PANIC } from './data';
import { chance, clamp, log, pick, rand, teamMessage, randomChannel } from './util';

/** A bug lands in a module. Severity 1-3. */
export function spawnBug(
  state: GameState,
  moduleId: string,
  author?: string,
  severity: number = 1,
) {
  const m = state.modules.find((mod) => mod.id === moduleId);
  if (!m) return;
  const dmg = Math.round(4 + severity * 3 + rand(0, 4));
  m.health = clamp(m.health - dmg, 0, 100);
  m.debt = clamp(m.debt + 3, 0, 100);
  log(state, `🐛 Bug in ${m.name} — health -${dmg}`, 'bad');
  if (chance(0.6)) {
    teamMessage(
      state,
      '#incidents',
      author ?? 'oncall-bot',
      pick(TEAM_PANIC),
    );
  }
}

/** End-of-day codebase simulation: debt decay, health drift, cascades. */
export function tickCodebase(state: GameState) {
  for (const m of state.modules) {
    if (state.guidelinesEnforced) {
      m.debt = clamp(m.debt - 2, 0, 100);
    }
    // debt rots health; clean modules slowly heal
    const drift = -m.debt * 0.02 + (m.debt < 40 ? 1.2 : 0) + rand(-1, 1);
    m.health = clamp(m.health + drift, 0, 100);
  }

  // cascading failures: sick modules drag down a random neighbor
  for (const m of state.modules) {
    if (m.health < 30 && chance(0.5)) {
      const others = state.modules.filter((mod) => mod.id !== m.id);
      const victim = pick(others);
      victim.health = clamp(victim.health - 5, 0, 100);
      log(
        state,
        `💥 Cascading failure: ${m.name} is dragging down ${victim.name}`,
        'chaos',
      );
      teamMessage(
        state,
        '#incidents',
        'oncall-bot',
        `why is ${victim.name} failing because of ${m.name}`,
      );
    }
  }
}
