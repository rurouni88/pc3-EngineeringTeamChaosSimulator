import type { GameState } from './types';
import { TEAM_CHANNELS } from './data';
import { RngEngine } from './seeded-rng';

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** All randomness goes through RngEngine so seeded runs are reproducible. */
export const rand = (min: number, max: number) =>
  min + RngEngine.random() * (max - min);

export const chance = (p: number) => RngEngine.random() < p;

export const pick = <T,>(arr: T[]): T =>
  arr[Math.floor(RngEngine.random() * arr.length)];

/** Fisher-Yates shuffle (new array) through RngEngine for seeded runs. */
export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(RngEngine.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function nextId(state: GameState): number {
  return state.nextId++;
}

export function log(
  state: GameState,
  text: string,
  kind: 'info' | 'good' | 'bad' | 'chaos' = 'info',
) {
  state.log.unshift({ day: state.day, text, kind });
  if (state.log.length > 200) state.log.pop();
}

export function teamMessage(
  state: GameState,
  channel: string,
  author: string,
  text: string,
) {
  state.teamMessages.push({ id: nextId(state), day: state.day, channel, author, text });
  if (state.teamMessages.length > 100) state.teamMessages.shift();
}

export const randomChannel = () => pick(TEAM_CHANNELS);

/** System stability = average module health (0-100) */
export function stability(state: GameState): number {
  const avg =
    state.modules.reduce((sum, m) => sum + m.health, 0) / state.modules.length;
  return Math.round(avg);
}

/** Average tech debt across modules (0-100) */
export function avgDebt(state: GameState): number {
  return Math.round(
    state.modules.reduce((sum, m) => sum + m.debt, 0) / state.modules.length,
  );
}

export function moduleById(state: GameState, id: string) {
  return state.modules.find((m) => m.id === id);
}
