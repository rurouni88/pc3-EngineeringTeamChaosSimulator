import { useState } from 'react';
import type { Role } from '../engine/types';
import { RngEngine } from '../engine/seeded-rng';
import { ACHIEVEMENTS, loadUnlocked } from '../engine/achievements';
import { TitleTerminal } from './TitleTerminal';
import { Leaderboard } from './Leaderboard';

const ROLES: { id: Role; title: string; desc: string; tools: string; emoji: string }[] = [
  {
    id: 'PO',
    title: 'Product Owner',
    emoji: '📋',
    desc: 'You write the specs. Vague specs produce vague, broken outcomes.',
    tools: 'Write Specs · Add Tickets · Cut Scope',
  },
  {
    id: 'EM',
    title: 'Engineering Manager',
    emoji: '🧯',
    desc: 'You are the buffer between the chaos and the humans. Mediate wars, enforce guidelines.',
    tools: '1:1s · Code Reviews · Mediate · Guidelines',
  },
  {
    id: 'CIO',
    title: 'CIO',
    emoji: '💼',
    desc: 'You manage the money and the people who manage the people. OKRs on by default.',
    tools: 'Hire · Fire · Invest in Infra · Cut Scope',
  },
];

const SEED_RE = /^[A-Z0-9]{8}$/;

export function StartScreen({
  onStart,
  onContinue,
  hasSave,
}: {
  onStart: (role: Role, seed: string) => void;
  onContinue: () => void;
  hasSave: boolean;
}) {
  const [seed, setSeed] = useState<string>(() => RngEngine.generateSeed());
  const [editing, setEditing] = useState(false);
  const unlocked = loadUnlocked();

  const start = (role: Role) => {
    if (SEED_RE.test(seed)) RngEngine.seedWith(seed);
    else RngEngine.unseed();
    onStart(role, seed);
  };

  return (
    <div className="h-dvh overflow-y-auto flex flex-col items-center justify-center gap-3 sm:gap-5 p-3 sm:p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-widest">ETCS</h1>
        <p className="text-slate-400 text-xs sm:text-base mt-1 sm:mt-2">
          Engineering Team Chaos Simulator
        </p>
      </div>

      <TitleTerminal />

      {/* Seed row */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-slate-500">SEED</span>
        {editing ? (
          <input
            value={seed}
            onChange={(e) =>
              setSeed(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))
            }
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            className="w-24 bg-slate-900 border border-cyan-500/50 rounded px-2 py-1 text-cyan-300 uppercase outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to edit seed"
            className="text-cyan-300 hover:text-cyan-200 underline decoration-dotted"
          >
            {seed}
          </button>
        )}
        <button
          onClick={() => setSeed(RngEngine.generateSeed())}
          title="Generate new seed"
          className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 hover:border-cyan-500/60"
        >
          🎲
        </button>
        {hasSave && (
          <button
            onClick={onContinue}
            className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
          >
            ▶ Continue
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => start(r.id)}
            className="text-left bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-5 hover:border-cyan-500/60 hover:bg-slate-800/60 active:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">{r.emoji}</span>
              <span className="text-base sm:text-lg font-bold text-slate-100">{r.title}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 sm:mt-2">{r.desc}</div>
            <div className="text-[10px] text-cyan-400 mt-2 sm:mt-3">{r.tools}</div>
          </button>
        ))}
      </div>

      <Leaderboard />

      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] text-slate-500 font-mono">
          🏅 {unlocked.length}/{ACHIEVEMENTS.length} achievements
        </div>
        {unlocked.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 max-w-lg">
            {unlocked.map((id) => {
              const a = ACHIEVEMENTS.find((achievement) => achievement.id === id);
              return a ? (
                <span key={id} title={`${a.title} — ${a.desc}`} className="text-sm cursor-help">
                  {a.emoji}
                </span>
              ) : null;
            })}
          </div>
        )}
        <p className="text-[10px] sm:text-xs text-slate-600 text-center">
          Lose: stability hits 0, or the budget dies. Win: survive day 30 with 50%+ stability.
        </p>
      </div>
    </div>
  );
}
