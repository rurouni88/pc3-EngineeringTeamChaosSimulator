import type { GameState } from '../engine/types';
import { ARCHETYPE_MAP } from '../engine/data';
import { actions } from '../engine/GameEngine';

interface Props {
  state: GameState;
  selected: number | null;
  onSelect: (id: number | null) => void;
  onAction: (fn: (s: GameState) => GameState) => void;
}

const STATUS_STYLE: Record<string, string> = {
  working: 'text-emerald-400',
  slacking: 'text-slate-400',
  arguing: 'text-rose-400',
  panicking: 'text-rose-400',
  'on-leave': 'text-amber-400',
  ghosted: 'text-slate-500',
};

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function EngineerRoster({ state, selected, onSelect, onAction }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 min-h-0 flex flex-col">
      <h2 className="text-sm font-bold text-pink-400 mb-3">
        THE MINIONS <span className="text-slate-500 font-normal text-xs">(click to select, then click a ticket to assign)</span>
      </h2>
      <div className="space-y-2 overflow-y-auto pr-1">
        {state.engineers.map((e) => {
          const arch = ARCHETYPE_MAP[e.archetypeId];
          const ticket = state.tickets.find((t) => t.id === e.assignedTicketId);
          const isSel = selected === e.id;
          return (
            <div
              key={e.id}
              onClick={() => onSelect(isSel ? null : e.id)}
              className={`cursor-pointer rounded-lg border p-2 text-xs transition-colors ${
                isSel
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{arch.emoji}</span>
                <span className="font-bold text-slate-100">{e.name}</span>
                <span className="text-slate-500">{arch.name}</span>
                <span className={`ml-auto ${STATUS_STYLE[e.status]}`}>{e.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Energy</div>
                  <MiniBar value={e.energy} color="bg-sky-500" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Morale</div>
                  <MiniBar value={e.morale} color="bg-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Burnout</div>
                  <MiniBar value={e.burnout} color="bg-rose-500" />
                </div>
              </div>
              {ticket && (
                <div className="mt-1 text-slate-400 truncate">
                  🎫 {ticket.title} ({Math.round(ticket.progress)}/{ticket.effort})
                </div>
              )}
              {e.lastAction && (
                <div className="mt-1 text-[10px] text-slate-500 italic truncate">{e.lastAction}</div>
              )}
              <div className="flex gap-2 mt-1.5" onClick={(ev) => ev.stopPropagation()}>
                {state.role === 'EM' && (
                  <button
                    onClick={() => onAction((s) => actions.oneOnOne(s, e.id))}
                    className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] hover:bg-emerald-500/30"
                  >
                    🫖 1:1
                  </button>
                )}
                {state.role === 'CIO' && (
                  <button
                    onClick={() => onAction((s) => actions.fire(s, e.id))}
                    className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] hover:bg-rose-500/30"
                  >
                    🪓 Fire
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
