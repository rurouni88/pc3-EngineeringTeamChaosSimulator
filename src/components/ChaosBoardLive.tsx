// ChaosBoardLive — live module dashboard for mobile.
// Rebranded as "Grafana" — the monitoring tool every corporate team
// pretends they understand. Shows real-time module health/debt from
// game state in the compact layout designed for the title screen.

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
    <div className="w-full bg-secondary border border-theme rounded-xl p-3 font-mono text-[10px] flex-1 min-h-0 overflow-y-auto">
      {/* Grafana header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-[10px] text-white font-bold">G</div>
          <span className="text-sm font-bold text-orange-400">Grafana</span>
          <span className="text-[9px] text-muted">dashboard: etcs-production</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
          stab >= 60 ? 'bg-emerald-500/20 text-emerald-400' :
          stab >= 30 ? 'bg-amber-500/20 text-amber-400' :
          'bg-rose-500/20 text-rose-400 animate-pulse'
        }`}>
          {stab >= 60 ? '✓ HEALTHY' : stab >= 30 ? '⚠ DEGRADED' : '✕ CRITICAL'}
        </span>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {modules.map((m) => (
          <div
            key={m.name}
            className={`rounded border px-2 py-1.5 transition-all duration-300 ${
              m.health < 30
                ? 'border-rose-500/50 bg-rose-500/10'
                : 'border-theme bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-secondary font-bold text-[10px]">{m.name}</span>
              <span className={`text-[9px] ${
                m.health < 30 ? 'text-rose-400' : 'text-muted'
              }`}>
                {Math.round(m.health)}%
              </span>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-primary h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.color} transition-all duration-300`}
                  style={{ width: `${m.health}%` }}
                />
              </div>
              <div className="flex-1 bg-primary h-1.5 rounded-full overflow-hidden">
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
      <div className="mt-2 pt-2 border-t border-theme flex items-center justify-between text-[9px] text-muted">
        <span>refresh: 5s · last check: now</span>
        <span>Day {state.day}/30 · ${state.budget}k</span>
      </div>
    </div>
  );
}
