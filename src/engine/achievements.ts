// Achievements — satirical end-of-quarter honors.
// Pattern borrowed from d20().devLife: a typed definition with a pure
// check(state) predicate, evaluated at game over. Unlocked ids persist in
// localStorage so they accumulate across quarters.

import type { GameState } from './types';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  check: (s: GameState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'quarter_survived',
    title: 'It Worked On My Machine',
    desc: 'Survive the quarter with 50%+ stability.',
    emoji: '🏆',
    check: (s) => s.gameOver === 'win',
  },
  {
    id: 'zero_incidents',
    title: 'Zero Incidents',
    desc: 'Win the quarter with every module above 30 HP. The on-call rotation weeps with joy.',
    emoji: '✨',
    check: (s) => s.gameOver === 'win' && s.modules.every((m) => m.health > 30),
  },
  {
    id: 'layoff_season',
    title: 'Layoff Season',
    desc: 'Fire 3 engineers in a single quarter. HR has started a group chat.',
    emoji: '🪓',
    check: (s) => s.stats.fired >= 3,
  },
  {
    id: 'review_war_veteran',
    title: 'Review War Veteran',
    desc: 'Mediate 5 code review wars. You now smell faintly of compromise.',
    emoji: '🕊️',
    check: (s) => s.stats.mediated >= 5,
  },
  {
    id: 'purple_button',
    title: 'The Purple Button',
    desc: 'Survive 10 PM interruptions. The button is purple. You are not okay.',
    emoji: '🟣',
    check: (s) => s.stats.interruptions >= 10,
  },
  {
    id: 'quarter_in_the_green',
    title: 'Quarter in the Green',
    desc: 'End the quarter with more budget than you started with.',
    emoji: '📈',
    check: (s) => s.budget >= 800 && s.day > 1,
  },
  {
    id: 'ship_it',
    title: 'Ship It',
    desc: 'Ship 15 tickets to production. The deploy bot considers you a friend.',
    emoji: '🚀',
    check: (s) => s.stats.shipped >= 15,
  },
  {
    id: 'guideline_purist',
    title: 'Guideline Purist',
    desc: 'Win the quarter with architecture guidelines enforced.',
    emoji: '📐',
    check: (s) => s.gameOver === 'win' && s.guidelinesEnforced,
  },
  {
    id: 'total_meltdown',
    title: 'Total Meltdown',
    desc: 'Let the system collapse. Somewhere, a postmortem is already being written.',
    emoji: '💀',
    check: (s) => s.gameOver === 'collapse',
  },
  {
    id: 'broke',
    title: 'The Budget Died',
    desc: 'Run the company into insolvency. The CIO search is already on LinkedIn.',
    emoji: '🏦',
    check: (s) => s.gameOver === 'bankrupt',
  },
];

const UNLOCKED_KEY = 'etcs_achievements';

export function loadUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function saveUnlocked(ids: string[]): void {
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/** Evaluate all achievements against a finished game. Returns the newly unlocked ones. */
export function checkAchievements(state: GameState): Achievement[] {
  const unlocked = loadUnlocked();
  const newly = ACHIEVEMENTS.filter((a) => !unlocked.includes(a.id) && a.check(state));
  if (newly.length > 0) {
    saveUnlocked([...unlocked, ...newly.map((a) => a.id)]);
  }
  return newly;
}

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
