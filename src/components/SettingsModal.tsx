// SettingsModal — game preferences: Dark Mode, Save Scum, Audio, Volume.
// Inspired by pc3-DevLife's settings screen.

import { useState, useEffect } from 'react';

interface Settings {
  darkMode: boolean;
  saveScum: boolean;
  audioEnabled: boolean;
  volume: number;
}

const SETTINGS_KEY = 'etcs_settings';

const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  saveScum: false,
  audioEnabled: false,
  volume: 50,
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

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-not-allowed">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 rounded-full transition-colors ${
        disabled
          ? 'bg-slate-700'
          : checked
            ? 'bg-indigo-500'
            : 'bg-slate-600'
      } peer-focus:ring-2 peer-focus:ring-indigo-500/50`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
          checked ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
        }`} />
      </div>
    </label>
  );
}

function SettingRow({ label, help, children, disabled }: {
  label: string;
  help: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`text-xs ${disabled ? 'text-slate-600' : 'text-slate-300'}`}>{label}</span>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-4 h-4 rounded-full bg-slate-700 text-[8px] text-slate-400 flex items-center justify-center hover:bg-slate-600"
          title={help}
        >
          ?
        </button>
        {showHelp && (
          <div className="absolute left-4 right-4 bottom-0 bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px] text-slate-400 z-10">
            {help}
          </div>
        )}
      </div>
      <div className={disabled ? 'opacity-50' : ''}>{children}</div>
    </div>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-indigo-400">⚙️ Settings</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
        </div>

        {/* Settings list */}
        <div className="space-y-0">
          {/* Dark Mode */}
          <SettingRow
            label="Dark Mode"
            help="Toggle dark mode. On by default — because productivity is overrated."
          >
            <ToggleSwitch
              checked={settings.darkMode}
              onChange={() => update('darkMode', !settings.darkMode)}
            />
          </SettingRow>

          {/* Save Scum */}
          <SettingRow
            label="Save Scum"
            help="Enable saving during a run. Because apparently one life isn't enough to get things right."
          >
            <ToggleSwitch
              checked={settings.saveScum}
              onChange={() => update('saveScum', !settings.saveScum)}
            />
          </SettingRow>

          {/* Audio (disabled) */}
          <SettingRow
            label="Audio"
            help="Turn sound effects on or off. Coming soon — your ears will thank you."
            disabled
          >
            <ToggleSwitch
              checked={settings.audioEnabled}
              onChange={() => {}}
              disabled
            />
          </SettingRow>

          {/* Volume (disabled) */}
          <SettingRow
            label="Volume"
            help="Controls sound volume. Coming soon — don't blast your neighbors."
            disabled
          >
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                disabled
                className="w-24 h-1 bg-slate-700 rounded-full appearance-none cursor-not-allowed"
              />
              <span className="text-xs text-slate-600 font-mono w-8 text-right">{settings.volume}%</span>
            </div>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
