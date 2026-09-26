import type { GameState } from '../engine/types';
import { actions, skipToEOD } from '../engine/GameEngine';
import { avgDebt, stability } from '../engine/util';

interface Props {
  state: GameState;
  onAction: (fn: (s: GameState) => GameState) => void;
  paused: boolean;
  onTogglePause: () => void;
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-slate-400">{label}</span>
      <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right">{value}%</span>
    </div>
  );
}

const stabColor = (v: number) => (v >= 60 ? 'bg-emerald-500' : v >= 30 ? 'bg-amber-500' : 'bg-rose-500');

export function StatusBar({ state, onAction, paused, onTogglePause }: Props) {
  const stab = stability(state);
  const debt = avgDebt(state);
  const clock = `0${Math.min(9 + state.hour - 1, 17)}:00`;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 border-b border-slate-800 bg-slate-900/80 text-sm">
      <div className="font-black text-cyan-400 tracking-widest font-display">ETCS</div>
      <div className="text-slate-400">
        Day <span className="text-slate-100">{Math.min(state.day, 30)}</span>/30 · {clock}
      </div>
      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30">
        {state.role}
      </span>

      <div className="order-last w-full lg:order-none lg:w-auto flex flex-wrap items-center gap-x-6 gap-y-1 justify-center">
        <Bar label="Stability" value={stab} color={stabColor(stab)} />
        <Bar label="Tech Debt" value={debt} color={debt >= 60 ? 'bg-rose-500' : 'bg-amber-500'} />
        <div className="text-xs">
          <span className="text-slate-400">Budget </span>
          <span className={state.budget < 100 ? 'text-rose-400' : 'text-emerald-400'}>
            ${state.budget}k
          </span>
        </div>
        {state.guidelinesEnforced && (
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30">
            📐 Guidelines ON
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">AP</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < state.ap ? 'bg-emerald-400' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>

      {state.role === 'PO' && (
        <button
          onClick={() => onAction(actions.addTicket)}
          className="px-2 py-1 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs hover:bg-sky-500/30"
        >
          + Ticket
        </button>
      )}
      {state.role === 'EM' && (
        <button
          onClick={() => onAction(actions.toggleGuidelines)}
          className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs hover:bg-cyan-500/30"
        >
          Guidelines: {state.guidelinesEnforced ? 'OFF' : 'ON'}
        </button>
      )}
      {state.role === 'CIO' && (
        <>
          <button
            onClick={() => onAction(actions.hire)}
            className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-500/30"
          >
            Hire $100k
          </button>
          <button
            onClick={() => onAction(actions.investInfra)}
            className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-500/30"
          >
            Invest $80k
          </button>
        </>
      )}

      <button
        onClick={onTogglePause}
        className={`px-3 py-1 rounded text-xs font-bold border ${
          paused
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
            : 'bg-slate-500/20 border-slate-500/50 text-slate-300 hover:bg-slate-500/30'
        }`}
      >
        {paused ? '▶ RESUME' : '⏸ PAUSE'}
      </button>
      <button
        onClick={() => onAction(skipToEOD)}
        disabled={paused}
        className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ⏭ SKIP TO EOD
      </button>
    </div>
  );
}
