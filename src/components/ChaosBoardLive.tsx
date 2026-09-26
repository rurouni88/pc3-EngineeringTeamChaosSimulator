// ChaosBoardLive — live module dashboard for mobile.
// Shows real-time module health/debt from game state in the compact
// layout designed for the title screen. Used in the mobile System tab.

import type { GameState } from '../engine/types';
import { stability } from '../engine/util';

interface ModuleState {
  name: string;
  color: string;
  health: number;
  debt: number;
}

export function ChaosBoardLive({ state }: { state: GameState }) {
  const modules: ModuleState[] = state.modules.map((m) => ({
    name: m.name,
    color: m.health >= 60 ? 'bg-emerald-500' : m.health >= 30 ? 'bg-amber-500' : 'bg-rose-500',
    health: m.health,
    debt: m.debt,
  }));

  const stab = stability(state);
  const stabColor = stab >= 60 ? 'bg-emerald-500' : stab >= 30 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-slate-500">system health</span>
        </div>
        <span className={`text-[9px] px-1 py-0.5 rounded ${
          stab >= 60 ? 'bg-emerald-500/20 text-emerald-400' :
          stab >= 30 ? 'bg-amber-500/20 text-amber-400' :
          'bg-rose-500/20 text-rose-400'
        }`}>
          {stab}% STAB
        </span>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 gap-1">
        {modules.map((m) => (
          <div
            key={m.name}
            className={`rounded border px-1.5 py-1 transition-all duration-300 ${
              m.health < 30
                ? 'border-rose-500/50 bg-rose-500/10'
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-300 font-bold">{m.name}</span>
              <span className={`text-[9px] ${
                m.health < 30 ? 'text-rose-400' : 'text-slate-500'
              }`}>
                {Math.round(m.health)}%
              </span>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.color} transition-all duration-300`}
                  style={{ width: `${m.health}%` }}
                />
              </div>
              <div className="flex-1 bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.debt >= 50 ? 'bg-rose-500' : m.debt >= 30 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all duration-300`}
                  style={{ width: `${m.debt}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-1 pt-1 border-t border-slate-700 flex items-center justify-between">
        <span className="text-slate-500">Day {state.day}/30</span>
        <span className="text-slate-500">${state.budget}k</span>
      </div>
    </div>
  );
}
