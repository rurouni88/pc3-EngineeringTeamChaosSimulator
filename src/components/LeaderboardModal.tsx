// LeaderboardModal — best quarters per role, from the MetaStore.
// Modal version of the Leaderboard component.

import type { Role } from '../engine/types';
import { MetaStore } from '../engine/meta';

const ROLES: Role[] = ['PO', 'EM', 'CIO'];
const ROLE_EMOJI: Record<Role, string> = { PO: '📋', EM: '🧯', CIO: '💼' };

export function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const runs = MetaStore.load().topRuns;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-400">🏆 Best Quarters</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {runs.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm">No quarters played yet</div>
            <div className="text-xs text-slate-600 mt-1">Start a game to see your best runs</div>
          </div>
        ) : (
          <div className="space-y-4">
            {ROLES.map((role) => {
              const top = runs.filter((r) => r.role === role).slice(0, 3);
              return (
                <div key={role} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                  <div className="text-sm text-slate-300 font-bold mb-2">
                    {ROLE_EMOJI[role]} {role === 'PO' ? 'Product Owner' : role === 'EM' ? 'Eng Manager' : 'CIO'}
                  </div>
                  {top.length === 0 ? (
                    <div className="text-[10px] text-slate-600">no quarters yet</div>
                  ) : (
                    <div className="space-y-1.5">
                      {top.map((r, i) => (
                        <div key={i} className="flex justify-between text-xs text-slate-400">
                          <span>
                            <span className={r.won ? 'text-emerald-400' : 'text-rose-400'}>
                              {r.won ? '✓ Won' : '✗ Lost'}
                            </span>
                            {' · '}D{r.day}
                            {' · '}
                            <span className="text-slate-300">{Math.round(r.stability)}% stab</span>
                          </span>
                          <span className="text-slate-600">
                            {r.shipped}🚀 · {r.seed ? r.seed.slice(0, 6) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
