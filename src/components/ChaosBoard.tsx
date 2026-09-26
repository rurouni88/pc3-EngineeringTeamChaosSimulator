// ChaosBoard — animated dashboard preview on the title screen.
// Shows architecture modules appearing, connecting, then flashing red
// as tech debt and burnout metrics spike. Visually distinct from a
// terminal typewriter; uses CSS grid + animated bars.

import { useEffect, useRef, useState } from 'react';

interface ModuleState {
  name: string;
  color: string;
  health: number;
  debt: number;
  label: string;
}

const MODULES: ModuleState[] = [
  { name: 'Gateway', color: 'bg-cyan-500', health: 80, debt: 20, label: 'API' },
  { name: 'Auth', color: 'bg-purple-500', health: 70, debt: 30, label: 'OAuth' },
  { name: 'Payments', color: 'bg-emerald-500', health: 60, debt: 40, label: '$$$' },
  { name: 'Pipeline', color: 'bg-amber-500', health: 50, debt: 50, label: 'ETL' },
  { name: 'Mobile', color: 'bg-pink-500', health: 75, debt: 15, label: 'iOS' },
  { name: 'Monolith', color: 'bg-rose-500', health: 40, debt: 60, label: 'LEGACY' },
];

const CHAOS_EVENTS = [
  'deploy to prod',
  'merge conflict',
  'on-call page',
  'code review',
  'sprint retro',
  'budget cut',
  'security audit',
  'feature creep',
];

export function ChaosBoard() {
  const [phase, setPhase] = useState<'building' | 'stable' | 'chaos'>('building');
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      // Phase 1: modules appear one by one
      setPhase('building');
      for (let i = 0; i < MODULES.length; i++) {
        if (cancelled) return;
        setModules((prev) => [...prev, { ...MODULES[i] }]);
        await sleep(400);
      }

      // Phase 2: briefly stable
      setPhase('stable');
      await sleep(1800);

      // Phase 3: chaos — metrics degrade, events pile up
      setPhase('chaos');
      let chaosModules = MODULES.map((m) => ({ ...m }));
      for (let t = 0; t < 60 && !cancelled; t++) {
        await sleep(120);
        setTick((prev) => prev + 1);
        chaosModules = chaosModules.map((m) => {
          const healthChange = m.debt > 40 ? Math.random() * -5 : Math.random() * 2;
          const debtChange = Math.random() * 4;
          return {
            ...m,
            health: Math.max(0, Math.min(100, m.health + healthChange)),
            debt: Math.max(0, Math.min(100, m.debt + debtChange)),
          };
        });
        setModules(chaosModules);
        if (t % 3 === 0) {
          setEvents((prev) => [
            `⚠️ ${CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)]}`,
            ...prev.slice(0, 4),
          ]);
        }
      }

      // Reset and loop
      await sleep(1200);
      if (!cancelled) {
        setModules([]);
        setEvents([]);
        setTick(0);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const healthColor = (v: number) =>
    v >= 60 ? 'bg-emerald-500' : v >= 30 ? 'bg-amber-500' : 'bg-rose-500';

  const debtColor = (v: number) => (v >= 50 ? 'bg-rose-500' : v >= 30 ? 'bg-amber-500' : 'bg-emerald-500');

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs h-52 flex flex-col" >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-slate-500 text-[10px]">etcs — live monitoring</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          phase === 'building' ? 'bg-cyan-500/20 text-cyan-400' :
          phase === 'stable' ? 'bg-emerald-500/20 text-emerald-400' :
          'bg-rose-500/20 text-rose-400 animate-pulse'
        }`}>
          {phase === 'building' ? 'INITIALIZING' : phase === 'stable' ? 'NOMINAL' : 'CRITICAL'}
        </span>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {modules.map((m) => (
          <div
            key={m.name}
            className={`rounded border p-1.5 transition-all duration-300 ${
              phase === 'chaos' && m.health < 30
                ? 'border-rose-500/50 bg-rose-500/10'
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-300 font-bold text-[10px]">{m.name}</span>
              <span className="text-[9px] text-slate-500">{m.label}</span>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[8px] text-slate-500 w-6">HP</span>
              <div className="flex-1 bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${healthColor(m.health)} transition-all duration-300`}
                  style={{ width: `${m.health}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 w-6 text-right">{Math.round(m.health)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-slate-500 w-6">DBT</span>
              <div className="flex-1 bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${debtColor(m.debt)} transition-all duration-300`}
                  style={{ width: `${m.debt}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 w-6 text-right">{Math.round(m.debt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chaos events feed */}
      <div className="border-t border-slate-700 pt-1.5 flex-1 min-h-0 flex flex-col">
        <div className="text-[9px] text-slate-500 mb-0.5">EVENTS</div>
        <div className="space-y-0.5 overflow-y-auto flex-1 min-h-0">
          {events.map((e, i) => (
            <div
              key={i}
              className={`text-[9px] ${
                i === 0
                  ? 'text-rose-400'
                  : i === 1
                    ? 'text-amber-400'
                    : 'text-slate-500'
              }`}
            >
              {e}
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-[9px] text-slate-600">no incidents</div>
          )}
        </div>
      </div>

      {/* Ticker */}
      <div className="mt-1.5 border-t border-slate-700 pt-1 overflow-hidden">
        <div className="text-[8px] text-slate-600 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          tick {tick} · uptime: {Math.max(0, 30 - Math.floor(tick / 10))} days
        </div>
      </div>
    </div>
  );
}
