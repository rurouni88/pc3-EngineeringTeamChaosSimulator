// OptionsModal — settings and management options on the title screen.

import { MetaStore } from '../engine/meta';
import { saveUnlocked } from '../engine/achievements';

export function OptionsModal({
  onClose,
  onResetMeta,
}: {
  onClose: () => void;
  onResetMeta: () => void;
}) {
  const meta = MetaStore.load();

  const handleResetMeta = () => {
    if (window.confirm('Reset all lifetime statistics and achievements? This cannot be undone.')) {
      onResetMeta();
      onClose();
    }
  };

  const handleResetAchievements = () => {
    if (window.confirm('Reset all achievements? This cannot be undone.')) {
      saveUnlocked([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-400 tracking-widest">⚙️ OPTIONS</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-3 mb-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Lifetime Stats</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Total Runs</span>
              <div className="font-bold text-slate-100">{meta.totalRuns}</div>
            </div>
            <div>
              <span className="text-slate-500">Wins</span>
              <div className="font-bold text-emerald-400">{meta.wins}</div>
            </div>
            <div>
              <span className="text-slate-500">Best Stability</span>
              <div className="font-bold text-cyan-400">{meta.bestStability}%</div>
            </div>
            <div>
              <span className="text-slate-500">Win Rate</span>
              <div className="font-bold text-amber-400">
                {meta.totalRuns > 0 ? Math.round((meta.wins / meta.totalRuns) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleResetAchievements}
            className="w-full px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors text-left"
          >
            🗑️ Reset Achievements
          </button>
          <button
            onClick={handleResetMeta}
            className="w-full px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors text-left"
          >
            💥 Reset All Statistics
          </button>
        </div>
      </div>
    </div>
  );
}
