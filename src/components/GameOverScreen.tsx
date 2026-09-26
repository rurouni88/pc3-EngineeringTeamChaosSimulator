import type { GameState } from '../engine/types';
import { stability } from '../engine/util';
import type { Achievement } from '../engine/achievements';

const OUTCOMES: Record<string, { title: string; msg: string; color: string }> = {
  win: {
    title: '🏆 QUARTER SURVIVED',
    msg: 'The system is alive, the board is (mildly) impressed, and nobody burned out on camera. Legendary management.',
    color: 'text-emerald-400',
  },
  collapse: {
    title: '💀 SYSTEM COLLAPSE',
    msg: 'The architecture gave up. The war room is now a physical room with a physical whiteboard and a physical scream.',
    color: 'text-rose-400',
  },
  bankrupt: {
    title: '🏦 BUDGET DEPLETED',
    msg: 'The money ran out before the chaos did. The lawyers are already in the lobby. They bring their own coffee.',
    color: 'text-amber-400',
  },
};

export function GameOverScreen({
  state,
  onRestart,
  newAchievements = [],
}: {
  state: GameState;
  onRestart: () => void;
  newAchievements?: Achievement[];
}) {
  const o = OUTCOMES[state.gameOver ?? 'collapse'];
  return (
    <div className="h-dvh overflow-y-auto flex flex-col items-center justify-center gap-4 sm:gap-6 p-4 sm:p-8 text-center">
      <h1 className={`text-4xl font-bold ${o.color}`}>{o.title}</h1>
      <p className="text-secondary max-w-lg text-sm">{o.msg}</p>
      <div className="flex gap-8 text-sm text-secondary">
        <div>
          <div className="text-2xl font-bold">{Math.min(state.day, 30)}</div>
          <div className="text-xs text-muted">days survived</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stability(state)}%</div>
          <div className="text-xs text-muted">final stability</div>
        </div>
        <div>
          <div className="text-2xl font-bold">${state.budget}k</div>
          <div className="text-xs text-muted">remaining budget</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{state.engineers.length}</div>
          <div className="text-xs text-muted">minions remaining</div>
        </div>
      </div>
      {newAchievements.length > 0 && (
        <div className="w-full max-w-md bg-secondary border border-amber-500/40 rounded-xl p-3">
          <div className="text-xs uppercase tracking-widest text-amber-400 mb-2">
            🏅 New achievements
          </div>
          {newAchievements.map((a) => (
            <div key={a.id} className="text-sm text-primary">
              {a.emoji} <span className="font-bold">{a.title}</span>
              <div className="text-[10px] text-muted">{a.desc}</div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onRestart}
        className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold hover:bg-cyan-500/30"
      >
        ↻ RESTART THE QUARTER
      </button>
    </div>
  );
}
