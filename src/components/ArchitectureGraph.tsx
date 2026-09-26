import type { GameState } from '../engine/types';

function healthStyle(health: number) {
  if (health >= 60)
    return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300';
  if (health >= 30)
    return 'bg-amber-950/40 border-amber-500/40 text-amber-300';
  return 'bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse';
}

/** The codebase health map: modules change color with debt & damage. */
export function ArchitectureGraph({ state }: { state: GameState }) {
  return (
    <div className="bg-secondary border border-theme rounded-xl p-3 lg:p-4 flex flex-col shrink-0">
      <h2 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        SYSTEM ARCHITECTURE
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {state.modules.map((m) => (
          <div
            key={m.id}
            className={`border rounded-lg p-3 text-center transition-colors duration-700 ${healthStyle(m.health)}`}
          >
            <div className="text-xs font-bold truncate">{m.name}</div>
            <div className="mt-1 text-[10px] opacity-80">
              HP {Math.round(m.health)} · Debt {Math.round(m.debt)}
            </div>
            <div className="mt-1 w-full bg-primary/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${m.health}%`,
                  backgroundColor:
                    m.health >= 60 ? '#10b981' : m.health >= 30 ? '#f59e0b' : '#f43f5e',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
