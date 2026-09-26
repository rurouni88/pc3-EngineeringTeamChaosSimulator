// AchievementModal — shows all achievements with locked/unlocked states.

import { ACHIEVEMENTS, loadUnlocked } from '../engine/achievements';

export function AchievementModal({ onClose }: { onClose: () => void }) {
  const unlocked = loadUnlocked();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-secondary border border-slate-700 rounded-xl p-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-amber-400 tracking-widest">🏅 ACHIEVEMENTS</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-slate-300 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="text-[10px] text-muted mb-3">
          {unlocked.length}/{ACHIEVEMENTS.length} unlocked
        </div>

        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.includes(a.id);
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-2 text-xs ${
                  isUnlocked
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-theme bg-primary/50 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isUnlocked ? a.emoji : '🔒'}</span>
                  <div>
                    <div className={`font-bold ${isUnlocked ? 'text-slate-100' : 'text-muted'}`}>
                      {a.title}
                    </div>
                    <div className="text-[10px] text-muted">{a.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
