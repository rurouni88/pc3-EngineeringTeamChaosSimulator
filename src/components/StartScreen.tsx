import { useState } from 'react';
import type { Role } from '../engine/types';
import { RngEngine } from '../engine/seeded-rng';
import { ACHIEVEMENTS, loadUnlocked } from '../engine/achievements';
import { MetaStore } from '../engine/meta';
import { ChaosBoard } from './ChaosBoard';
import { Leaderboard } from './Leaderboard';
import { AchievementModal } from './AchievementModal';
import { HelpModal } from './HelpModal';
import { OptionsModal } from './OptionsModal';
import { RoleSelector } from './RoleSelector';



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
  const [activeModal, setActiveModal] = useState<'achievements' | 'help' | 'options' | null>(null);
  const unlocked = loadUnlocked();

  const start = (role: Role) => {
    if (SEED_RE.test(seed)) RngEngine.seedWith(seed);
    else RngEngine.unseed();
    onStart(role, seed);
  };



  return (
    <div className="h-dvh overflow-y-auto flex flex-col items-center justify-center gap-3 sm:gap-5 p-3 sm:p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-cyan-400 tracking-widest font-display">ETCS</h1>
        <p className="text-slate-400 text-xs sm:text-base mt-1 sm:mt-2 font-display tracking-wider">
          Engineering Team Chaos Simulator
        </p>
        <p className="text-rose-500/80 text-[10px] sm:text-xs mt-2 italic">
          Because every quarter is a bloodbath — you just manage the casualties better.
        </p>
      </div>

      <ChaosBoard />

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

      <RoleSelector onStart={(role) => start(role)} />

      {/* Modal buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveModal('achievements')}
          className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          🏅 Achievements
        </button>
        <button
          onClick={() => setActiveModal('help')}
          className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          📖 Help
        </button>
        <button
          onClick={() => setActiveModal('options')}
          className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          ⚙️ Options
        </button>
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

      {/* Modals */}
      {activeModal === 'achievements' && <AchievementModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'help' && <HelpModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'options' && <OptionsModal onClose={() => setActiveModal(null)} onResetMeta={() => {
        MetaStore.save({ totalRuns: 0, wins: 0, losses: 0, bestStability: 0, lastRunDate: '', topRuns: [] });
      }} />}
    </div>
  );
}
