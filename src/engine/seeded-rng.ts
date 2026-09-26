// Seeded random number generator — mulberry32.
// Fast, deterministic, good-enough quality for game use.
// All dice rolls, shuffles, event picks, and loot rolls go through this
// engine so a run is fully reproducible from its 8-character seed.
// Unseeded (the default), it falls back to Math.random().

const SEED_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SEED_LENGTH = 8;

// Parse a seed string to a 32-bit integer (base-36 positional).
// Note: 36^8 (the seed space) exceeds 2^32, so distinct seeds can share
// the same PRNG state (~650 seeds per state). Collisions are harmless —
// they just mean two different seed strings happen to replay identically.
function parseSeed(seed: string): number {
  let result = 0;
  for (let i = 0; i < seed.length; i++) {
    const idx = SEED_CHARSET.indexOf(seed[i]);
    if (idx === -1) return 0; // invalid character
    result = result * SEED_CHARSET.length + idx;
  }
  return result >>> 0;
}

// Format a 32-bit integer back to an 8-char uppercase seed string
// (big-endian base-36, so parseSeed(formatSeed(n)) === n).
function formatSeed(num: number): string {
  let n = num >>> 0;
  const chars: string[] = [];
  for (let i = 0; i < SEED_LENGTH; i++) {
    chars.push(SEED_CHARSET[n % SEED_CHARSET.length]);
    n = Math.floor(n / SEED_CHARSET.length);
  }
  return chars.reverse().join('');
}

// Snapshot of the PRNG position — persisted in run saves so a loaded
// seeded run resumes from the exact same point in the sequence.
export interface RngSnapshot {
  seed: string;
  state: number | null;
}

export const RngEngine = {
  // Current seed string (empty when unseeded).
  seed: '',

  // The mulberry32 register (null when unseeded → Math.random).
  _state: null as number | null,

  // Generate a random 8-char alphanumeric seed. Uses Math.random on
  // purpose: the seed is the one value that must NOT come from the
  // engine it seeds.
  generateSeed(): string {
    let result = '';
    for (let i = 0; i < SEED_LENGTH; i++) {
      result += SEED_CHARSET[Math.floor(Math.random() * SEED_CHARSET.length)];
    }
    return result;
  },

  // Seed the RNG with an 8-char alphanumeric string.
  seedWith(seed: string): void {
    this.seed = seed;
    this._state = parseSeed(seed);
  },

  // Unseed — fall back to Math.random().
  unseed(): void {
    this.seed = '';
    this._state = null;
  },

  // Current random number in [0, 1).
  random(): number {
    if (this._state === null) return Math.random();
    // Mulberry32: advance the register, then mix.
    this._state = (this._state + 0x6D2B79F5) | 0;
    let t = this._state;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  },

  // Generic n-sided die: returns a random integer in [1, sides].
  dRoll(sides: number): number {
    return Math.floor(this.random() * sides) + 1;
  },

  // 20-sided die — stat checks and saving rolls.
  d20(): number { return this.dRoll(20); },

  // Fisher-Yates shuffle: returns a new uniformly shuffled array.
  shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  },

  // Snapshot the engine (seed + register) for run saves.
  getState(): RngSnapshot {
    return { seed: this.seed, state: this._state };
  },

  // Restore a snapshot. Missing/null (old saves, unseeded runs) → unseed.
  // A seed without a register (hand-built saves) resumes from the
  // sequence start for that seed.
  setState(snap: RngSnapshot | null | undefined): void {
    if (!snap || !snap.seed) {
      this.unseed();
      return;
    }
    this.seed = snap.seed;
    this._state = snap.state !== null ? snap.state : parseSeed(snap.seed);
  },

  // Parse a formatted seed back to a number (test/diagnostic helper).
  parseSeed(seed: string): number {
    return parseSeed(seed);
  },

  // Format a number as an 8-char uppercase alphanumeric seed.
  formatSeed(num: number): string {
    return formatSeed(num);
  },
};
