import { describe, expect, it, beforeAll } from 'vitest';
import { RngEngine } from '../seeded-rng';
import { newGame, runGameTick, actions, WORKING_HOURS } from '../GameEngine';
import { SaveData, SaveSystem } from '../save';
import { MetaStore } from '../meta';
import { ACHIEVEMENTS, checkAchievements, loadUnlocked, saveUnlocked } from '../achievements';
import { stability } from '../util';
import type { GameState } from '../types';

// In-memory localStorage (vitest runs in node, where it doesn't exist).
const store = new Map<string, string>();
beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
  });
  store.clear();
});

describe('RngEngine', () => {
  it('produces identical sequences for the same seed', () => {
    RngEngine.seedWith('ABCDEFGH');
    const a = Array.from({ length: 20 }, () => RngEngine.random());
    RngEngine.seedWith('ABCDEFGH');
    const b = Array.from({ length: 20 }, () => RngEngine.random());
    expect(a).toEqual(b);
  });

  it('produces different sequences for different seeds', () => {
    RngEngine.seedWith('AAAAAAAA');
    const a = Array.from({ length: 10 }, () => RngEngine.random());
    RngEngine.seedWith('BBBBBBBB');
    const b = Array.from({ length: 10 }, () => RngEngine.random());
    expect(a).not.toEqual(b);
  });

  it('round-trips parse/format (for values under 2^32)', () => {
    // 36^8 exceeds 2^32, so only seeds whose positional value fits in 32
    // bits round-trip exactly (documented in seeded-rng.ts). A-Z are
    // digits 0-25, so leading 'AA' keeps the value small.
    expect(RngEngine.formatSeed(RngEngine.parseSeed('AAXK2Z9P'))).toBe('AAXK2Z9P');
  });

  it('distinct seeds map to distinct PRNG states (mostly)', () => {
    // 36^8 > 2^32, so ~650 seeds share a state — but nearby seeds differ.
    expect(RngEngine.parseSeed('AAAAAAAA')).not.toBe(RngEngine.parseSeed('AAAAAAAB'));
  });

  it('falls back to Math.random when unseeded', () => {
    RngEngine.unseed();
    const v = RngEngine.random();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
    expect(RngEngine.seed).toBe('');
  });
});

describe('newGame', () => {
  it('builds a valid day-1 state', () => {
    RngEngine.unseed();
    const s = newGame('EM');
    expect(s.day).toBe(1);
    expect(s.hour).toBe(1);
    expect(s.ap).toBe(3);
    expect(s.budget).toBe(800);
    expect(s.engineers).toHaveLength(3);
    expect(s.tickets).toHaveLength(6);
    expect(s.modules).toHaveLength(6);
    expect(s.gameOver).toBeNull();
    expect(s.stats).toEqual({ shipped: 0, fired: 0, mediated: 0, interruptions: 0 });
  });

  it('starts CIO with OKRs active', () => {
    RngEngine.unseed();
    expect(newGame('CIO').okrActive).toBe(true);
    expect(newGame('PO').okrActive).toBe(false);
  });
});

describe('seeded determinism', () => {
  it('two seeded games with no actions evolve identically', () => {
    const play = () => {
      RngEngine.seedWith('DETERMIN');
      let s = newGame('PO');
      for (let i = 0; i < 64; i++) s = runGameTick(s);
      return s;
    };
    expect(JSON.stringify(play())).toBe(JSON.stringify(play()));
  });

  it('different seeds can diverge', () => {
    const play = (seed: string) => {
      RngEngine.seedWith(seed);
      let s = newGame('EM');
      for (let i = 0; i < 128; i++) s = runGameTick(s);
      return s;
    };
    // Not a hard guarantee, but 128 ticks of cascading randomness will
    // diverge for these seeds.
    expect(JSON.stringify(play('SEEDAAAA'))).not.toBe(JSON.stringify(play('SEEDBBBB')));
  });
});

describe('runGameTick', () => {
  it('advances the clock and returns a new object', () => {
    RngEngine.unseed();
    const s = newGame('PO');
    const next = runGameTick(s);
    expect(next).not.toBe(s);
    expect(next.hour).toBe(2);
    expect(next.day).toBe(1);
  });

  it('rolls the day over after working hours', () => {
    RngEngine.unseed();
    let s = newGame('PO');
    for (let i = 0; i < WORKING_HOURS - 1; i++) s = runGameTick(s);
    expect(s.day).toBe(2);
    expect(s.hour).toBe(1);
    expect(s.ap).toBe(3); // AP refreshes each day
  });
});

describe('actions', () => {
  it('assign moves an engineer to a ticket (free)', () => {
    RngEngine.unseed();
    const s = newGame('EM');
    const t = s.tickets[0];
    const e = s.engineers[0];
    const next = actions.assign(s, t.id, e.id);
    expect(next.engineers.find((x) => x.id === e.id)?.assignedTicketId).toBe(t.id);
    expect(next.ap).toBe(s.ap);
    // Unassign
    const back = actions.assign(next, t.id, null);
    expect(back.engineers.find((x) => x.id === e.id)?.assignedTicketId).toBeNull();
  });

  it('writeSpec costs 1 AP and raises clarity', () => {
    RngEngine.unseed();
    const s = newGame('PO');
    const t = s.tickets.find((x) => x.specClarity < 60)!;
    const next = actions.writeSpec(s, t.id);
    const after = next.tickets.find((x) => x.id === t.id)!;
    expect(next.ap).toBe(s.ap - 1);
    expect(after.specClarity).toBeGreaterThan(t.specClarity);
  });

  it('cutScope removes the ticket', () => {
    RngEngine.unseed();
    const s = newGame('PO');
    const t = s.tickets[0];
    const next = actions.cutScope(s, t.id);
    expect(next.tickets.find((x) => x.id === t.id)).toBeUndefined();
    expect(next.ap).toBe(s.ap - 1);
  });

  it('mediate clears a review war and counts it', () => {
    RngEngine.unseed();
    const s = newGame('EM');
    const t = s.tickets[0];
    t.stuckInReview = true;
    const next = actions.mediate(s, t.id);
    expect(next.tickets.find((x) => x.id === t.id)!.stuckInReview).toBe(false);
    expect(next.stats.mediated).toBe(1);
    expect(next.ap).toBe(s.ap - 1);
  });

  it('fire removes an engineer and counts it', () => {
    RngEngine.unseed();
    const s = newGame('CIO');
    const e = s.engineers[0];
    const next = actions.fire(s, e.id);
    expect(next.engineers.find((x) => x.id === e.id)).toBeUndefined();
    expect(next.stats.fired).toBe(1);
  });

  it('actions are no-ops without AP', () => {
    RngEngine.unseed();
    const s = newGame('PO');
    s.ap = 0;
    const t = s.tickets[0];
    expect(actions.writeSpec(s, t.id)).toBe(s); // returns the original state
  });
});

describe('full playthrough', () => {
  it('always terminates within the quarter', () => {
    RngEngine.seedWith('PLAYTHRU');
    let s = newGame('EM');
    let ticks = 0;
    while (!s.gameOver && ticks < 32 * WORKING_HOURS) {
      s = runGameTick(s);
      ticks++;
    }
    expect(s.gameOver).not.toBeNull();
    expect(['win', 'collapse', 'bankrupt']).toContain(s.gameOver);
    expect(stability(s)).toBeGreaterThanOrEqual(0);
    expect(stability(s)).toBeLessThanOrEqual(100);
  });
});

describe('SaveData', () => {
  it('accepts a valid save', () => {
    RngEngine.seedWith('SAVESEED');
    const s = newGame('PO');
    const data = { state: s, rng: RngEngine.getState(), timestamp: 123 };
    expect(SaveData.validate(data)).toEqual([]);
    expect(SaveData.parse(data)?.state.day).toBe(1);
  });

  it('reports ALL problems at once for a broken save', () => {
    const errors = SaveData.validate({ state: { day: 'nope' }, timestamp: 'also nope' });
    expect(errors.length).toBeGreaterThan(1);
    expect(errors.join(' ')).toContain('timestamp');
    expect(errors.join(' ')).toContain('state.day');
  });

  it('round-trips through SaveSystem and restores the PRNG', () => {
    RngEngine.seedWith('ROUNDTRP');
    const s = newGame('CIO');
    SaveSystem.save(s);
    const next = RngEngine.random(); // the value the NEXT draw must produce
    expect(SaveSystem.hasSave()).toBe(true);

    RngEngine.unseed(); // simulate a fresh page load
    const loaded = SaveSystem.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.day).toBe(1);
    expect(loaded!.role).toBe('CIO');
    expect(RngEngine.random()).toBe(next); // resumed mid-sequence
    SaveSystem.deleteSave();
    expect(SaveSystem.hasSave()).toBe(false);
  });
});

describe('MetaStore', () => {
  it('records runs and ranks wins above losses', () => {
    MetaStore.recordRunComplete({
      role: 'PO', won: false, day: 12, stability: 20, budget: 100, shipped: 3,
      seed: 'LOSER001', date: '2026-01-01',
    });
    MetaStore.recordRunComplete({
      role: 'PO', won: true, day: 30, stability: 70, budget: 900, shipped: 18,
      seed: 'WINNER01', date: '2026-01-02',
    });
    const meta = MetaStore.load();
    expect(meta.totalRuns).toBeGreaterThanOrEqual(2);
    const top = MetaStore.getTopRuns('PO', 1);
    expect(top[0].won).toBe(true);
  });
});

describe('achievements', () => {
  it('evaluates every definition against a finished game without throwing', () => {
    saveUnlocked([]);
    RngEngine.seedWith('ACHIEVE1');
    let s: GameState = newGame('EM');
    while (!s.gameOver) s = runGameTick(s);
    const newly = checkAchievements(s);
    for (const a of ACHIEVEMENTS) expect(() => a.check(s)).not.toThrow();
    expect(newly.every((a) => loadUnlocked().includes(a.id))).toBe(true);
  });

  it('does not re-unlock the same achievement', () => {
    saveUnlocked([]);
    RngEngine.seedWith('ACHIEVE2');
    let s: GameState = newGame('PO');
    while (!s.gameOver) s = runGameTick(s);
    checkAchievements(s);
    const second = checkAchievements(s);
    expect(second).toEqual([]);
  });
});
