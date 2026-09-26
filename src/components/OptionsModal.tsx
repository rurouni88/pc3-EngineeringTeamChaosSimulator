// OptionsModal — game settings, stats, and reset on the title screen.
// Settings are shown inline (no extra click-through).

import { useState, useEffect } from 'react';
import { MetaStore } from '../engine/meta';
import { saveUnlocked } from '../engine/achievements';

type Tab = 'settings' | 'stats' | 'reset';
type Theme = 'normal' | 'dark' | 'light';

interface Settings {
  theme: Theme;
  saveScum: boolean;
  audioEnabled: boolean;
  volume: number;
}

const SETTINGS_KEY = 'etcs_settings';

const DEFAULT_SETTINGS: Settings = {
  theme: 'normal',
  saveScum: false,
  audioEnabled: false,
  volume: 50,
};

const THEME_LABELS: Record<Theme, string> = {
  normal: 'Normal',
  dark: 'Dark',
  light: 'Light',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Corrupted — use defaults.
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage full — silently fail.
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-10 h-5 rounded-full transition-colors ${
        disabled ? 'bg-tertiary' : checked ? 'bg-indigo-500' : 'bg-tertiary'
      } peer-focus:ring-2 peer-focus:ring-indigo-500/50`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`} />
      </div>
    </label>
  );
}

export function OptionsModal({
  onClose,
  onResetMeta,
}: {
  onClose: () => void;
  onResetMeta: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    applyTheme(s.theme);
    return s;
  });
  const meta = MetaStore.load();

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'theme') applyTheme(value as Theme);
      return next;
    });
  };

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
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'reset', label: 'Reset', icon: '🗑️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-secondary border border-theme rounded-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-secondary tracking-widest">⚙️ OPTIONS</h2>
          <button onClick={onClose} className="text-muted hover:text-secondary text-lg">✕</button>
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
                  : 'border-theme text-muted hover:border-theme'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Settings Tab — inline, no sub-modal */}
        {activeTab === 'settings' && (
          <div className="space-y-1">
            {/* Theme */}
            <div className="flex items-center justify-between py-2.5 border-b border-theme">
              <span className="text-xs text-secondary">Theme</span>
              <div className="flex gap-1">
                {(['normal', 'dark', 'light'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => update('theme', t)}
                    className={`px-2.5 py-1 rounded text-[10px] border transition-colors ${
                      settings.theme === t
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'border-theme text-muted hover:border-theme'
                    }`}
                  >
                    {THEME_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Scum */}
            <div className="flex items-center justify-between py-2.5 border-b border-theme">
              <div>
                <span className="text-xs text-secondary">Save Scum</span>
                <div className="text-[9px] text-muted">Save mid-run. One life isn't enough.</div>
              </div>
              <ToggleSwitch
                checked={settings.saveScum}
                onChange={() => update('saveScum', !settings.saveScum)}
              />
            </div>

            {/* Audio (disabled) */}
            <div className="flex items-center justify-between py-2.5 border-b border-theme opacity-50">
              <div>
                <span className="text-xs text-secondary">Audio</span>
                <div className="text-[9px] text-muted">Coming soon</div>
              </div>
              <ToggleSwitch checked={settings.audioEnabled} onChange={() => {}} disabled />
            </div>

            {/* Volume (disabled) */}
            <div className="flex items-center justify-between py-2.5 opacity-50">
              <div>
                <span className="text-xs text-secondary">Volume</span>
                <div className="text-[9px] text-muted">Coming soon</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  disabled
                  className="w-20 h-1 bg-tertiary rounded-full appearance-none cursor-not-allowed"
                />
                <span className="text-[10px] text-muted font-mono w-7 text-right">{settings.volume}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-primary/50 rounded-lg border border-theme p-3">
            <div className="text-[10px] text-muted uppercase tracking-widest mb-2">Lifetime Stats</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted">Total Runs</span>
                <div className="font-bold text-primary">{meta.totalRuns}</div>
              </div>
              <div>
                <span className="text-muted">Wins</span>
                <div className="font-bold text-emerald-400">{meta.wins}</div>
              </div>
              <div>
                <span className="text-muted">Best Stability</span>
                <div className="font-bold text-cyan-400">{meta.bestStability}%</div>
              </div>
              <div>
                <span className="text-muted">Win Rate</span>
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
    </div>
  );
}
