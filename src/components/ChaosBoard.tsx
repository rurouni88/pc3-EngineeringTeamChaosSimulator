// ChaosBoard — animated dashboard preview on the title screen.
// Shows architecture modules appearing, connecting, then flashing red
// as tech debt and burnout metrics spike. Compact layout that fits
// within the title screen without overflow.

import { useEffect, useRef, useState } from 'react';

interface ModuleState {
  name: string;
  color: string;
  health: number;
  debt: number;
}

const MODULES: ModuleState[] = [
  { name: 'Gateway', color: 'bg-cyan-500', health: 80, debt: 20 },
  { name: 'Auth', color: 'bg-purple-500', health: 70, debt: 30 },
  { name: 'Payments', color: 'bg-emerald-500', health: 60, debt: 40 },
  { name: 'Monolith', color: 'bg-rose-500', health: 40, debt: 60 },
];

export function ChaosBoard() {
  const [phase, setPhase] = useState<'building' | 'stable' | 'chaos'>('building');
  const [modules, setModules] = useState<ModuleState[]>([]);
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
        await sleep(300);
      }

      // Phase 2: briefly stable
      setPhase('stable');
      await sleep(1200);

      // Phase 3: chaos — metrics degrade
      setPhase('chaos');
      let chaosModules = MODULES.map((m) => ({ ...m }));
      for (let t = 0; t < 40 && !cancelled; t++) {
        await sleep(100);
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
      }

      // Reset and loop
      await sleep(800);
      if (!cancelled) {
        setModules([]);
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
    <div className="w-full max-w-md bg-secondary border border-theme rounded-lg p-2 font-mono text-[10px] h-48 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-muted">etcs — monitoring</span>
        </div>
        <span className={`text-[9px] px-1 py-0.5 rounded ${
          phase === 'building' ? 'bg-cyan-500/20 text-cyan-400' :
          phase === 'stable' ? 'bg-emerald-500/20 text-emerald-400' :
          'bg-rose-500/20 text-rose-400 animate-pulse'
        }`}>
          {phase === 'building' ? 'INIT' : phase === 'stable' ? 'OK' : '⚠ CRITICAL'}
        </span>
      </div>

      {/* Module grid — compact 2-col layout */}
      <div className="grid grid-cols-2 gap-1 flex-1 min-h-0">
        {modules.map((m) => (
          <div
            key={m.name}
            className={`rounded border px-1.5 py-1 transition-all duration-300 ${
              phase === 'chaos' && m.health < 30
                ? 'border-rose-500/50 bg-rose-500/10'
                : 'border-theme bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-secondary font-bold">{m.name}</span>
              <span className={`text-[9px] ${
                phase === 'chaos' && m.health < 30 ? 'text-rose-400' : 'text-muted'
              }`}>
                {Math.round(m.health)}%
              </span>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-primary h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${healthColor(m.health)} transition-all duration-300`}
                  style={{ width: `${m.health}%` }}
                />
              </div>
              <div className="flex-1 bg-primary h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${debtColor(m.debt)} transition-all duration-300`}
                  style={{ width: `${m.debt}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer ticker */}
      <div className="mt-1 pt-1 border-t border-theme flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-muted">tick {tick}</span>
        </div>
        <span className="text-muted">
          {Math.max(0, 30 - Math.floor(tick / 10))}d left
        </span>
      </div>
    </div>
  );
}
