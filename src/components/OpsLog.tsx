import type { GameState } from '../engine/types';

const KIND_STYLE: Record<string, string> = {
  info: 'text-secondary',
  good: 'text-emerald-400',
  bad: 'text-rose-400',
  chaos: 'text-amber-400 font-bold',
};

/** Ops log: the last 3 things that happened to your empire. */
export function OpsLog({ state }: { state: GameState }) {
  return (
    <div className="bg-secondary border border-theme rounded-lg px-3 py-2 shrink-0">
      <div className="space-y-0.5 text-[10px]">
        {state.log.slice(0, 3).map((l, i) => (
          <div key={i} className={KIND_STYLE[l.kind]}>
            <span className="text-muted">d{l.day}</span> {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
