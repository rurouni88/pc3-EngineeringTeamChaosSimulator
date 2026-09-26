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
  slacking: 'text-secondary',
  arguing: 'text-rose-400',
  panicking: 'text-rose-400',
  'on-leave': 'text-amber-400',
  ghosted: 'text-muted',
};

const STATUS_EMOJI: Record<string, string> = {
  working: '✅',
  slacking: '😴',
  arguing: '😤',
  panicking: '🤯',
  'on-leave': '🏖️',
  ghosted: '👻',
};

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted w-8">{label}</span>
      <div className="flex-1 bg-tertiary h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[9px] text-secondary w-6 text-right">{value}%</span>
    </div>
  );
}

export function EngineerRoster({ state, selected, onSelect, onAction }: Props) {
  return (
    <div className="bg-secondary border border-theme rounded-xl p-3 flex-1 min-h-0 flex flex-col">
      <h2 className="text-sm font-bold text-pink-400 mb-3">
        THE MINIONS
        <span className="text-muted font-normal text-xs ml-2">
          (tap to select, then tap a ticket to assign)
        </span>
      </h2>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {state.engineers.map((e) => {
          const arch = ARCHETYPE_MAP[e.archetypeId];
          const ticket = state.tickets.find((t) => t.id === e.assignedTicketId);
          const isSel = selected === e.id;
          return (
            <div
              key={e.id}
              onClick={() => onSelect(isSel ? null : e.id)}
              className={`cursor-pointer rounded-lg border p-3 text-xs transition-colors ${
                isSel
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-theme bg-primary/50 hover:border-theme'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{arch.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-primary">{e.name}</div>
                  <div className="text-[10px] text-muted">{arch.name}</div>
                </div>
                <span className={`text-xs ${STATUS_STYLE[e.status]}`}>
                  {STATUS_EMOJI[e.status]} {e.status}
                </span>
              </div>

              {/* Stacked bars */}
              <div className="mt-2 space-y-1">
                <MiniBar label="Energy" value={e.energy} color="bg-sky-500" />
                <MiniBar label="Morale" value={e.morale} color="bg-emerald-500" />
                <MiniBar label="Burnout" value={e.burnout} color="bg-rose-500" />
              </div>

              {/* Assigned ticket */}
              {ticket && (
                <div className="mt-2 text-secondary text-[10px] truncate">
                  🎫 {ticket.title} ({Math.round(ticket.progress)}/{ticket.effort})
                </div>
              )}

              {/* Last action */}
              {e.lastAction && (
                <div className="mt-1 text-[10px] text-muted italic truncate">{e.lastAction}</div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-2" onClick={(ev) => ev.stopPropagation()}>
                {state.role === 'EM' && (
                  <button
                    onClick={() => onAction((s) => actions.oneOnOne(s, e.id))}
                    className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] hover:bg-emerald-500/30"
                  >
                    🫖 1:1
                  </button>
                )}
                {state.role === 'CIO' && (
                  <button
                    onClick={() => onAction((s) => actions.fire(s, e.id))}
                    className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] hover:bg-rose-500/30"
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
