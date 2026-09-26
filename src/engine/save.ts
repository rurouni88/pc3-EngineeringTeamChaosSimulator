// Save/Load system — auto-saves the live quarter to localStorage.
// Pattern borrowed from d20().devLife: SaveData owns the schema rules in
// one place, validate() reports ALL problems at once so a bad save is
// diagnosable from the console, and the PRNG position is snapshotted so a
// seeded run resumes from the exact same point in the sequence.

import type { GameState } from './types';
import { RngEngine, type RngSnapshot } from './seeded-rng';

interface SaveShape {
  state: GameState;
  rng: RngSnapshot | null;
  timestamp: number;
}

export class SaveData {
  constructor(
    public state: GameState,
    public rng: RngSnapshot | null,
    public timestamp: number,
  ) {}

  static parse(data: unknown): SaveData | null {
    const errors = SaveData.validate(data);
    if (errors.length > 0) {
      console.error('[ETCS] Save data is invalid:', errors.join('; '));
      return null;
    }
    const save = data as SaveShape;
    return new SaveData(save.state, save.rng ?? null, save.timestamp);
  }

  static validate(data: unknown): string[] {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return ['save is not an object'];
    }
    const save = data as Record<string, unknown>;
    const errors: string[] = [];

    if (typeof save.timestamp !== 'number') errors.push('timestamp is not a number');

    const state = save.state as Record<string, unknown> | undefined;
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      errors.push('state is missing');
    } else {
      for (const field of ['day', 'hour', 'ap', 'budget', 'nextId']) {
        if (typeof state[field] !== 'number') errors.push(`state.${field} is not a number`);
      }
      if (!['PO', 'EM', 'CIO'].includes(state.role as string)) {
        errors.push('state.role is not a valid role');
      }
      for (const field of ['guidelinesEnforced', 'okrActive']) {
        if (typeof state[field] !== 'boolean') errors.push(`state.${field} is not a boolean`);
      }
      const stats = state.stats as Record<string, unknown> | undefined;
      if (!stats || typeof stats !== 'object') {
        errors.push('state.stats is missing');
      } else {
        for (const field of ['shipped', 'fired', 'mediated', 'interruptions']) {
          if (typeof stats[field] !== 'number') errors.push(`state.stats.${field} is not a number`);
        }
      }
      for (const field of ['engineers', 'tickets', 'modules', 'slack', 'log']) {
        if (!Array.isArray(state[field])) errors.push(`state.${field} is not an array`);
      }
      if (state.gameOver !== null && !['win', 'collapse', 'bankrupt'].includes(state.gameOver as string)) {
        errors.push('state.gameOver is not a valid value');
      }
    }

    const rng = save.rng as Record<string, unknown> | undefined;
    if (rng !== undefined) {
      if (!rng || typeof rng !== 'object' || Array.isArray(rng)) {
        errors.push('rng is not an object');
      } else {
        if (typeof rng.seed !== 'string') errors.push('rng.seed is not a string');
        if (rng.state !== null && typeof rng.state !== 'number') {
          errors.push('rng.state is not a number or null');
        }
      }
    }

    return errors;
  }
}

export const SaveSystem = {
  SAVE_KEY: 'etcs_save',

  save(state: GameState): void {
    try {
      const saveData: SaveShape = {
        state: { ...state },
        rng: RngEngine.getState(),
        timestamp: Date.now(),
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      // Quota exceeded or private mode — never take the game down over a save.
      console.warn('[ETCS] Failed to save:', e);
    }
  },

  load(): GameState | null {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return null;
    try {
      const save = SaveData.parse(JSON.parse(raw));
      if (!save) return null;
      RngEngine.setState(save.rng);
      return save.state;
    } catch (e) {
      console.error('[ETCS] Failed to load save:', e);
      return null;
    }
  },

  hasSave(): boolean {
    try {
      return localStorage.getItem(this.SAVE_KEY) !== null;
    } catch {
      return false;
    }
  },

  deleteSave(): void {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch {
      // ignore
    }
  },
};
