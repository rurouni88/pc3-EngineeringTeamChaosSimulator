import { useState } from 'react';
import type { GameState, Ticket, TicketStage } from '../engine/types';
import { actions } from '../engine/GameEngine';

interface Props {
  state: GameState;
  selected: number | null;
  onAction: (fn: (s: GameState) => GameState) => void;
}

const STAGES: { id: TicketStage; label: string; color: string; emoji: string }[] = [
  { id: 'backlog', label: 'BACKLOG', color: 'text-secondary', emoji: '📥' },
  { id: 'inprogress', label: 'IN PROGRESS', color: 'text-sky-400', emoji: '🔨' },
  { id: 'qa', label: 'REVIEW / QA', color: 'text-amber-400', emoji: '🔍' },
  { id: 'production', label: 'DONE', color: 'text-emerald-400', emoji: '✅' },
];

const TYPE_BADGE: Record<Ticket['type'], string> = {
  feature: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  bug: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  epic: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

/** Custom inline assignee picker — replaces the browser <select> dropdown. */
function AssigneePicker({
  state,
  ticket,
  onAction,
}: {
  state: GameState;
  ticket: Ticket;
  onAction: Props['onAction'];
}) {
  const [open, setOpen] = useState(false);
  const assignee = state.engineers.find((e) => e.assignedTicketId === ticket.id);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded bg-tertiary/50 border border-theme text-[10px] text-secondary hover:border-indigo-500/40"
      >
        <span className="truncate">
          {assignee ? `👤 ${assignee.name}` : '— assign —'}
        </span>
        <span className="text-muted ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-secondary border border-theme rounded-lg shadow-lg max-h-32 overflow-y-auto">
          <button
            onClick={() => {
              onAction((s) => actions.assign(s, ticket.id, null));
              setOpen(false);
            }}
            className="w-full text-left px-2 py-1.5 text-[10px] text-muted hover:bg-tertiary"
          >
            — unassign —
          </button>
          {state.engineers.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                onAction((s) => actions.assign(s, ticket.id, e.id));
                setOpen(false);
              }}
              className={`w-full text-left px-2 py-1.5 text-[10px] hover:bg-tertiary ${
                e.assignedTicketId === ticket.id ? 'text-indigo-300 font-bold' : 'text-secondary'
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({
  state,
  ticket,
  selected,
  onAction,
}: {
  state: GameState;
  ticket: Ticket;
  selected: number | null;
  onAction: Props['onAction'];
}) {
  const module = state.modules.find((m) => m.id === ticket.moduleId);
  const assignee = state.engineers.find((e) => e.assignedTicketId === ticket.id);
  const overdue = ticket.deadline < state.day && !ticket.done;
  const pct = Math.min(100, Math.round((ticket.progress / ticket.effort) * 100));
  const prefix = state.role === 'PO' ? 'PO' : state.role === 'EM' ? 'EM' : 'CIO';
  const key = `${prefix}-${String(ticket.id).padStart(4, '0')}`;

  return (
    <div
      onClick={() => {
        if (selected !== null) onAction((s) => actions.assign(s, ticket.id, selected));
      }}
      className={`rounded-lg border p-2 text-xs space-y-1.5 bg-primary/70 transition-colors ${
        ticket.stuckInReview
          ? 'border-rose-500/70 animate-pulse'
          : selected !== null
            ? 'border-indigo-500/60 cursor-pointer hover:bg-indigo-500/10'
            : 'border-theme'
      }`}
    >
      {/* Ticket header */}
      <div className="flex items-center gap-1.5">
        <span className={`px-1 py-0.5 rounded border text-[9px] font-bold flex-shrink-0 ${TYPE_BADGE[ticket.type]}`}>
          {key}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-primary truncate text-[11px]">{ticket.title}</div>
        </div>
      </div>

      {/* Meta line */}
      <div className="text-[9px] text-muted">
        {module?.name} · spec {ticket.specClarity}% · d{ticket.deadline}
        {overdue && <span className="text-rose-400 font-bold ml-1">OVERDUE</span>}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-tertiary h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stuck in review */}
      {ticket.stuckInReview && (
        <div className="text-[9px] text-rose-400 font-bold">
          ⚔️ REVIEW WAR — stuck
        </div>
      )}

      {/* Action row: assignee picker + buttons */}
      <div className="flex gap-1" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex-1">
          <AssigneePicker state={state} ticket={ticket} onAction={onAction} />
        </div>
        <div className="flex gap-1 items-center">
          {state.role === 'PO' && (
            <button
              onClick={() => onAction((s) => actions.writeSpec(s, ticket.id))}
              className="px-1.5 py-1.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[9px] hover:bg-sky-500/30"
              title="Write spec (+40 clarity)"
            >
              📝
            </button>
          )}
          {(state.role === 'PO' || state.role === 'CIO') && (
            <button
              onClick={() => onAction((s) => actions.cutScope(s, ticket.id))}
              className="px-1.5 py-1.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] hover:bg-rose-500/30"
              title="Cut from scope"
            >
              ✂️
            </button>
          )}
          {state.role === 'EM' && (
            <button
              onClick={() => onAction((s) => actions.codeReview(s, ticket.id))}
              className="px-1.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[9px] hover:bg-cyan-500/30"
              title="Code review (+5 progress)"
            >
              🧐
            </button>
          )}
          {ticket.stuckInReview && (
            <button
              onClick={() => onAction((s) => actions.mediate(s, ticket.id))}
              className="px-1.5 py-1.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] hover:bg-rose-500/30"
              title="Mediate review war"
            >
              🕊️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** The Jira board: mobile-friendly vertical list grouped by stage. */
export function JiraBoard({ state, selected, onAction }: Props) {
  return (
    <div className="bg-secondary border border-theme rounded-xl p-2 lg:p-3 flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 lg:mb-3">
        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded bg-blue-600 flex items-center justify-center text-[9px] lg:text-[10px] text-white font-bold">J</div>
        <h2 className="text-xs lg:text-sm font-bold text-blue-400">JIRA</h2>
        <span className="text-[8px] lg:text-[9px] text-muted ml-auto">Sprint 4 · d{Math.max(0, 30 - state.day)} left</span>
      </div>

      {selected !== null && (
        <div className="text-[9px] lg:text-[10px] text-indigo-300 mb-2 bg-indigo-500/10 border border-indigo-500/30 rounded px-2 py-1">
          👆 Assigning to <b>{state.engineers.find((e) => e.id === selected)?.name}</b> — tap a ticket
        </div>
      )}

      {/* Ticket list grouped by stage */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {STAGES.map((stage) => {
          const tickets = state.tickets.filter((t) => t.stage === stage.id && !t.done);
          if (tickets.length === 0) return null;
          return (
            <div key={stage.id}>
              <div className={`text-[9px] lg:text-[10px] font-bold mb-1.5 ${stage.color} flex items-center gap-1`}>
                <span>{stage.emoji}</span>
                <span>{stage.label}</span>
                <span className="text-muted">({tickets.length})</span>
              </div>
              <div className="space-y-1.5">
                {tickets.map((t) => (
                  <TicketCard
                    key={t.id}
                    state={state}
                    ticket={t}
                    selected={selected}
                    onAction={onAction}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
