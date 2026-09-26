import type { GameState } from '../engine/types';

const KIND_STYLE: Record<string, string> = {
  info: 'text-secondary',
  good: 'text-emerald-400',
  bad: 'text-rose-400',
  chaos: 'text-amber-400 font-bold',
};

/** Ops log: the last few things that happened to your empire. */
export function OpsLog({ state }: { state: GameState }) {
  return (
    <div className="bg-secondary border border-theme rounded-xl p-3 mt-3">
      <h2 className="text-[10px] font-bold text-muted mb-1.5">OPS LOG</h2>
      <div className="space-y-0.5 text-[11px]">
        {state.log.slice(0, 5).map((l, i) => (
          <div key={i} className={KIND_STYLE[l.kind]}>
            <span className="text-slate-600">d{l.day}</span> {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
