// OptionsModal — settings, stats, and management options on the title screen.
// Tabbed interface: Settings | Statistics | Reset.

import { useState } from 'react';
import { MetaStore } from '../engine/meta';
import { saveUnlocked } from '../engine/achievements';
import { SettingsModal } from './SettingsModal';

type Tab = 'settings' | 'stats' | 'reset';

export function OptionsModal({
  onClose,
  onResetMeta,
}: {
  onClose: () => void;
  onResetMeta: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [showSettings, setShowSettings] = useState(false);
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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'stats', label: 'Statistics', icon: '📊' },
    { id: 'reset', label: 'Reset', icon: '🗑️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-400 tracking-widest">⚙️ OPTIONS</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs border ${
                activeTab === t.id
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:border-indigo-500/50 hover:text-indigo-400 transition-colors text-left"
            >
              🎮 Game Settings (Dark Mode, Save Scum, Audio)
            </button>
            <div className="text-[10px] text-slate-600 text-center py-2">
              Audio coming soon — your ears will thank you.
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-3">
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
        )}

        {/* Reset Tab */}
        {activeTab === 'reset' && (
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
        )}
      </div>

      {/* Settings sub-modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
