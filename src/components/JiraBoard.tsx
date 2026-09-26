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
      className={`rounded-lg border p-3 text-xs space-y-2 bg-primary/70 transition-colors ${
        ticket.stuckInReview
          ? 'border-rose-500/70 animate-pulse'
          : selected !== null
            ? 'border-indigo-500/60 cursor-pointer hover:bg-indigo-500/10'
            : 'border-theme'
      }`}
    >
      {/* Ticket header */}
      <div className="flex items-start gap-2">
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold flex-shrink-0 ${TYPE_BADGE[ticket.type]}`}>
          {key}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-100 truncate">{ticket.title}</div>
          <div className="text-[10px] text-muted truncate">
            {module?.name} · spec {ticket.specClarity}% · due d{ticket.deadline}
            {overdue && <span className="text-rose-400 font-bold ml-1">OVERDUE</span>}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Assignee */}
      <div className="text-[10px] text-muted">
        {assignee ? `👤 ${assignee.name}` : '— unassigned —'}
      </div>

      {/* Stuck in review */}
      {ticket.stuckInReview && (
        <div className="text-[10px] text-rose-400 font-bold">
          ⚔️ REVIEW WAR — stuck until mediated
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5" onClick={(ev) => ev.stopPropagation()}>
        <select
          value={assignee?.id ?? ''}
          onChange={(ev) =>
            onAction((s) =>
              actions.assign(s, ticket.id, ev.target.value ? Number(ev.target.value) : null),
            )
          }
          className="bg-secondary border border-slate-700 rounded text-[10px] px-2 py-1.5 flex-1 min-w-[120px]"
        >
          <option value="">— unassigned —</option>
          {state.engineers.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        {state.role === 'PO' && (
          <button
            onClick={() => onAction((s) => actions.writeSpec(s, ticket.id))}
            className="px-2 py-1.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] hover:bg-sky-500/30"
            title="Write a precise spec (+40 clarity)"
          >
            📝 Spec
          </button>
        )}
        {(state.role === 'PO' || state.role === 'CIO') && (
          <button
            onClick={() => onAction((s) => actions.cutScope(s, ticket.id))}
            className="px-2 py-1.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] hover:bg-rose-500/30"
            title="Cut from scope"
          >
            ✂️ Cut
          </button>
        )}
        {state.role === 'EM' && (
          <button
            onClick={() => onAction((s) => actions.codeReview(s, ticket.id))}
            className="px-2 py-1.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] hover:bg-cyan-500/30"
            title="Hands-on code review (+5 progress, -10 module debt)"
          >
            🧐 Review
          </button>
        )}
        {ticket.stuckInReview && (
          <button
            onClick={() => onAction((s) => actions.mediate(s, ticket.id))}
            className="px-2 py-1.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] hover:bg-rose-500/30"
            title="Mediate the review war (any role, 1 AP)"
          >
            🕊️ Mediate
          </button>
        )}
      </div>
    </div>
  );
}

/** The Jira board: mobile-friendly vertical list grouped by stage. */
export function JiraBoard({ state, selected, onAction }: Props) {
  return (
    <div className="bg-secondary border border-theme rounded-xl p-3 flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">J</div>
        <h2 className="text-sm font-bold text-blue-400">JIRA</h2>
        <span className="text-[9px] text-slate-600 ml-auto">Sprint 4 · 30 days left</span>
      </div>

      <div className="text-[10px] text-muted mb-3">
        (select a minion, then tap a card to assign)
      </div>

      {/* Ticket list grouped by stage */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
        {STAGES.map((stage) => {
          const tickets = state.tickets.filter((t) => t.stage === stage.id && !t.done);
          if (tickets.length === 0) return null;
          return (
            <div key={stage.id}>
              <div className={`text-[10px] font-bold mb-2 ${stage.color} flex items-center gap-1.5`}>
                <span>{stage.emoji}</span>
                <span>{stage.label}</span>
                <span className="text-slate-600">({tickets.length})</span>
              </div>
              <div className="space-y-2">
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
