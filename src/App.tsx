import { useEffect, useRef, useState } from 'react';
import type { GameState, Role } from './engine/types';
import { newGame, runGameTick, WORKING_HOURS } from './engine/GameEngine';
import { SaveSystem } from './engine/save';
import { MetaStore } from './engine/meta';
import { checkAchievements, type Achievement } from './engine/achievements';
import { RngEngine } from './engine/seeded-rng';
import { stability } from './engine/util';
import { StatusBar } from './components/StatusBar';
import { ChaosBoardLive } from './components/ChaosBoardLive';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { EngineerRoster } from './components/EngineerRoster';
import { JiraBoard } from './components/JiraBoard';
import { SlackClone } from './components/SlackClone';
import { OpsLog } from './components/OpsLog';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ReorderableTabs } from './components/ReorderableTabs';

type Tab = 'board' | 'team' | 'system' | 'slack';

const DEFAULT_TABS: { id: Tab; label: string }[] = [
  { id: 'board', label: '🗂 JIRA' },
  { id: 'team', label: '👥 Team' },
  { id: 'system', label: '📊 Grafana' },
  { id: 'slack', label: '💬 Teams' },
];

const TAB_ORDER_KEY = 'etcs_tab_order';

function loadTabOrder(): Tab[] {
  try {
    const raw = localStorage.getItem(TAB_ORDER_KEY);
    if (raw) return JSON.parse(raw) as Tab[];
  } catch {
    // ignore
  }
  return DEFAULT_TABS.map((t) => t.id);
}

function saveTabOrder(order: Tab[]): void {
  try {
    localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [tabOrder, setTabOrder] = useState<Tab[]>(loadTabOrder);
  const [tab, setTab] = useState<Tab>('board');
  const [hasSave, setHasSave] = useState(() => SaveSystem.hasSave());
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const stateRef = useRef<GameState | null>(null);
  const recordedRef = useRef(false);
  stateRef.current = state;

  const running = !!state && !state.gameOver && !paused;

  // Game loop: 1 tick (1 working hour) per second.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setState((cur) => (cur ? runGameTick(cur) : cur));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  // Autosave at the end of each day: total completed ticks mod WORKING_HOURS === 0.
  useEffect(() => {
    if (!state || state.gameOver) return;
    const ticks = (state.day - 1) * WORKING_HOURS + state.hour;
    if (ticks % WORKING_HOURS === 0) SaveSystem.save(state);
  }, [state]);

  // Safety-net saves: tab hidden or page unload (so a crash mid-day loses < 8 ticks).
  useEffect(() => {
    const saveIfRunning = () => {
      const s = stateRef.current;
      if (s && !s.gameOver) SaveSystem.save(s);
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') saveIfRunning();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', saveIfRunning);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', saveIfRunning);
    };
  }, []);

  // Game over: record the run, evaluate achievements, clear the save.
  useEffect(() => {
    if (!state?.gameOver || recordedRef.current) return;
    recordedRef.current = true;
    setNewAchievements(checkAchievements(state));
    MetaStore.recordRunComplete({
      role: state.role,
      won: state.gameOver === 'win',
      day: state.day,
      stability: stability(state),
      budget: state.budget,
      shipped: state.stats.shipped,
      seed: RngEngine.seed,
      date: new Date().toISOString(),
    });
    SaveSystem.deleteSave();
    setHasSave(false);
  }, [state]);

  const resetMeta = () => {
    recordedRef.current = false;
    setNewAchievements([]);
    setSelected(null);
    setPaused(false);
    setTab('board');
  };

  const handleReorder = (order: string[]) => {
    setTabOrder(order as Tab[]);
    saveTabOrder(order as Tab[]);
  };

  const onAction = (fn: (s: GameState) => GameState) => {
    setState((cur) => (cur ? fn(cur) : cur));
  };

  if (!state) {
    return (
      <StartScreen
        onStart={(role: Role) => {
          resetMeta();
          setState(newGame(role));
        }}
        onContinue={() => {
          const s = SaveSystem.load();
          if (s) {
            resetMeta();
            setState(s);
          }
        }}
        hasSave={hasSave}
      />
    );
  }
  if (state.gameOver) {
    return (
      <GameOverScreen
        state={state}
        onRestart={() => {
          resetMeta();
          setState(null);
        }}
        newAchievements={newAchievements}
      />
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-slate-950 text-slate-100 font-mono">
      <StatusBar
        state={state}
        onAction={onAction}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
      />

      {/* MOBILE: one panel at a time, switched via tabs */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col">
        <ReorderableTabs
          tabs={tabOrder.map((id) => DEFAULT_TABS.find((t) => t.id === id)!)}
          activeTab={tab}
          onTabSelect={(id) => setTab(id as Tab)}
          onReorder={handleReorder}
        />
        <div className="flex-1 min-h-0 px-2 pb-2 flex flex-col">
          {tab === 'board' && (
            <>
              <JiraBoard state={state} selected={selected} onAction={onAction} />
              <OpsLog state={state} />
            </>
          )}
          {tab === 'team' && (
            <EngineerRoster
              state={state}
              selected={selected}
              onSelect={setSelected}
              onAction={onAction}
            />
          )}
          {tab === 'system' && <ChaosBoardLive state={state} />}
          {tab === 'slack' && <SlackClone state={state} />}
        </div>
      </div>

      {/* DESKTOP: full dashboard */}
      <div className="hidden lg:grid grid-cols-12 gap-3 p-3 flex-1 min-h-0">
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <ArchitectureGraph state={state} />
          <EngineerRoster
            state={state}
            selected={selected}
            onSelect={setSelected}
            onAction={onAction}
          />
        </div>
        <div className="col-span-5 flex flex-col min-h-0">
          <JiraBoard state={state} selected={selected} onAction={onAction} />
          <OpsLog state={state} />
        </div>
        <div className="col-span-3 min-h-0">
          <SlackClone state={state} />
        </div>
      </div>
    </div>
  );
}
