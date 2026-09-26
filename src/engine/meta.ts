// Meta progression — persists across quarters (run records, lifetime stats).
// Owns the 'etcs_meta' localStorage key; other modules must not read or
// write it directly. Pattern borrowed from d20().devLife's MetaStore.

import type { Role } from './types';

export interface RunRecord {
  role: Role;
  won: boolean;
  day: number;
  stability: number;
  budget: number;
  shipped: number;
  seed: string; // '' when unseeded
  date: string; // ISO
}

interface MetaState {
  totalRuns: number;
  wins: number;
  losses: number;
  bestStability: number;
  lastRunDate: string;
  topRuns: RunRecord[];
}

const EMPTY: MetaState = {
  totalRuns: 0,
  wins: 0,
  losses: 0,
  bestStability: 0,
  lastRunDate: '',
  topRuns: [],
};

export const MetaStore = {
  KEY: 'etcs_meta',
  MAX_RUNS: 30,

  load(): MetaState {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return { ...EMPTY, topRuns: [] };
    try {
      const meta = JSON.parse(raw);
      if (!meta || typeof meta !== 'object') return { ...EMPTY, topRuns: [] };
      return { ...EMPTY, ...meta, topRuns: Array.isArray(meta.topRuns) ? meta.topRuns : [] };
    } catch (e) {
      console.error('[ETCS] Meta data is corrupted; ignoring it', e);
      return { ...EMPTY, topRuns: [] };
    }
  },

  save(meta: MetaState): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(meta));
    } catch (e) {
      console.warn('[ETCS] Failed to save meta:', e);
    }
  },

  recordRunComplete(record: RunRecord): void {
    const meta = this.load();
    meta.totalRuns = (meta.totalRuns || 0) + 1;
    meta.wins = (meta.wins || 0) + (record.won ? 1 : 0);
    meta.losses = (meta.losses || 0) + (record.won ? 0 : 1);
    meta.bestStability = Math.max(meta.bestStability || 0, record.stability);
    meta.lastRunDate = record.date;
    // Keep the best runs: wins first, then stability, then furthest day.
    meta.topRuns = [...(meta.topRuns || []), record]
      .sort((a, b) => Number(b.won) - Number(a.won) || b.stability - a.stability || b.day - a.day)
      .slice(0, this.MAX_RUNS);
    this.save(meta);
  },

  getTopRuns(role: Role, n = 5): RunRecord[] {
    return this.load()
      .topRuns.filter((r) => r.role === role)
      .slice(0, n);
  },
};
