// Leaderboard — top quarters per role, from the MetaStore.

import type { Role } from '../engine/types';
import { MetaStore } from '../engine/meta';

const ROLES: Role[] = ['PO', 'EM', 'CIO'];
const ROLE_EMOJI: Record<Role, string> = { PO: '📋', EM: '🧯', CIO: '💼' };

export function Leaderboard() {
  const runs = MetaStore.load().topRuns;
  if (runs.length === 0) return null;

  return (
    <div className="w-full max-w-4xl">
      <div className="text-[10px] uppercase tracking-widest text-muted mb-2 text-center">
        Best quarters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ROLES.map((role) => {
          const top = runs.filter((r) => r.role === role).slice(0, 3);
          return (
            <div key={role} className="bg-secondary/60 border border-theme rounded-lg p-2">
              <div className="text-xs text-slate-300 font-bold mb-1">
                {ROLE_EMOJI[role]} {role}
              </div>
              {top.length === 0 ? (
                <div className="text-[10px] text-slate-600">no quarters yet</div>
              ) : (
                top.map((r, i) => (
                  <div key={i} className="flex justify-between text-[10px] text-secondary">
                    <span>
                      {r.won ? '✓' : '✗'} D{r.day} · {Math.round(r.stability)}%
                    </span>
                    <span className="text-slate-600">
                      {r.shipped}🚀 {r.seed ? r.seed.slice(0, 6) : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
