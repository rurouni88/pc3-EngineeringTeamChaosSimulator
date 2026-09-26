// SettingsModal — game preferences: Theme, Save Scum, Audio, Volume.
// Inspired by pc3-DevLife's settings screen.

import { useState, useEffect } from 'react';

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

const THEME_HELP: Record<Theme, string> = {
  normal: 'Default dark theme. Balanced contrast, easy on the eyes.',
  dark: 'Deeper blacks, higher contrast. For the true night owls.',
  light: 'Clean, bright theme. For when you need to see what you\'re doing.',
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
    <label className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 rounded-full transition-colors ${
        disabled
          ? 'bg-tertiary'
          : checked
            ? 'bg-indigo-500'
            : 'bg-tertiary'
      } peer-focus:ring-2 peer-focus:ring-indigo-500/50`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
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
    <div className="flex items-center justify-between py-3 border-b border-theme last:border-0">
      <div className="flex items-center gap-2">
        <span className={`text-xs ${disabled ? 'text-muted' : 'text-secondary'}`}>{label}</span>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-4 h-4 rounded-full bg-tertiary text-[8px] text-secondary flex items-center justify-center hover:bg-tertiary"
          title={help}
        >
          ?
        </button>
        {showHelp && (
          <div className="absolute left-4 right-4 bottom-0 bg-tertiary border border-theme rounded-lg p-2 text-[10px] text-secondary z-10">
            {help}
          </div>
        )}
      </div>
      <div className={disabled ? 'opacity-50' : ''}>{children}</div>
    </div>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    applyTheme(s.theme);
    return s;
  });

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (key === 'theme') {
      applyTheme(value as Theme);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-secondary border border-theme rounded-xl p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-indigo-400">⚙️ Settings</h2>
          <button onClick={onClose} className="text-muted hover:text-secondary text-xl">✕</button>
        </div>

        {/* Settings list */}
        <div className="space-y-0">
          {/* Theme selector */}
          <SettingRow
            label="Theme"
            help={THEME_HELP[settings.theme]}
          >
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
                className="w-24 h-1 bg-tertiary rounded-full appearance-none cursor-not-allowed"
              />
              <span className="text-xs text-muted font-mono w-8 text-right">{settings.volume}%</span>
            </div>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
