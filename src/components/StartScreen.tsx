import { useState } from 'react';
import type { Role } from '../engine/types';
import { RngEngine } from '../engine/seeded-rng';
import { ACHIEVEMENTS, loadUnlocked } from '../engine/achievements';
import { MetaStore } from '../engine/meta';
import { ChaosBoard } from './ChaosBoard';
import { AchievementModal } from './AchievementModal';
import { HelpModal } from './HelpModal';
import { OptionsModal } from './OptionsModal';
import { LeaderboardModal } from './LeaderboardModal';
import { RoleSelector } from './RoleSelector';

const TAGLINES = [
  'Because every quarter is a bloodbath — you just manage the casualties better.',
  'Where tech debt goes to compound interest.',
  'Predictable chaos. Unpredictable deadlines.',
  'Your team is one merge conflict away from a breakdown.',
  'Shipping features since the last sprint retro.',
  'Because "it works on my machine" is not a strategy.',
  'Management: where hope meets reality, and reality wins.',
  'The only thing more unstable than your codebase is your team morale.',
  'Because every architecture decision is just a future regret waiting to happen.',
  'Where standup meetings could have been calendar invites.',
  'Deploying on Friday is a lifestyle. Living it.',
  'Your backlog is a lie. Your deadlines are a joke. Your code is a crime scene.',
  'Because the customer always wants the button purple.',
  'Where CI/CD stands for "Continuous Incompetence and Deferring Deployment".',
  'The simuation is not real. The burnout is.',
  'Where "quick fix" means "technical debt with a deadline".',
  'Because every epic story is just a feature that gave up on itself.',
  'Where the monolith is not a choice, it is a hostage situation.',
  'Because the on-call rotation is just a fancy word for "your life".',
  'Where code reviews are just performance art for people who hate shipping.',
];

function pickTagline(seed: string): string {
  if (seed.length === 0) return TAGLINES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return TAGLINES[Math.abs(hash) % TAGLINES.length];
}



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
  const tagline = pickTagline(seed);
  const [editing, setEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<'achievements' | 'help' | 'options' | 'leaderboard' | null>(null);


  const start = (role: Role) => {
    if (SEED_RE.test(seed)) RngEngine.seedWith(seed);
    else RngEngine.unseed();
    onStart(role, seed);
  };



  return (
    <div className="h-dvh overflow-y-auto flex flex-col items-center justify-center gap-3 sm:gap-5 p-3 sm:p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-cyan-400 tracking-widest font-display">ETCS</h1>
        <p className="text-secondary text-xs sm:text-base mt-1 sm:mt-2 font-display tracking-wider">
          Engineering Team Chaos Simulator
        </p>
        <p className="text-rose-500/80 text-[10px] sm:text-xs mt-2 italic">
          {tagline}
        </p>
      </div>

      <ChaosBoard />

      {/* Seed row */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-muted">SEED</span>
        {editing ? (
          <input
            value={seed}
            onChange={(e) =>
              setSeed(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))
            }
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            className="w-24 bg-secondary border border-cyan-500/50 rounded px-2 py-1 text-cyan-300 uppercase outline-none"
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
          className="px-1.5 py-0.5 rounded bg-tertiary border border-theme hover:border-cyan-500/60"
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
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={() => setActiveModal('achievements')}
          className="px-2.5 py-1 rounded bg-tertiary border border-theme text-secondary text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          🏅 Achievements
        </button>
        <button
          onClick={() => setActiveModal('leaderboard')}
          className="px-2.5 py-1 rounded bg-tertiary border border-theme text-secondary text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={() => setActiveModal('help')}
          className="px-2.5 py-1 rounded bg-tertiary border border-theme text-secondary text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          📖 Help
        </button>
        <button
          onClick={() => setActiveModal('options')}
          className="px-2.5 py-1 rounded bg-tertiary border border-theme text-secondary text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
        >
          ⚙️ Options
        </button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] sm:text-xs text-muted text-center">
          Lose: stability hits 0, or the budget dies. Win: survive day 30 with 50%+ stability.
        </p>
        <div className="text-[9px] text-muted mt-2">Copyright 2026 PC3 Enterprises · v0.2.0</div>
      </div>

      {/* Modals */}
      {activeModal === 'achievements' && <AchievementModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'leaderboard' && <LeaderboardModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'help' && <HelpModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'options' && <OptionsModal onClose={() => setActiveModal(null)} onResetMeta={() => {
        MetaStore.save({ totalRuns: 0, wins: 0, losses: 0, bestStability: 0, lastRunDate: '', topRuns: [] });
      }} />}
    </div>
  );
}
