import type { GameState, Ticket, TicketStage } from '../engine/types';
import { actions } from '../engine/GameEngine';

interface Props {
  state: GameState;
  selected: number | null;
  onAction: (fn: (s: GameState) => GameState) => void;
}

const STAGES: { id: TicketStage; label: string; color: string }[] = [
  { id: 'backlog', label: 'BACKLOG', color: 'text-slate-400' },
  { id: 'inprogress', label: 'IN PROGRESS', color: 'text-sky-400' },
  { id: 'qa', label: 'REVIEW / QA', color: 'text-amber-400' },
  { id: 'production', label: 'PRODUCTION', color: 'text-emerald-400' },
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

  return (
    <div
      onClick={() => {
        if (selected !== null) onAction((s) => actions.assign(s, ticket.id, selected));
      }}
      className={`rounded-lg border p-2 text-xs space-y-1.5 bg-slate-950/70 transition-colors ${
        ticket.stuckInReview
          ? 'border-rose-500/70 animate-pulse'
          : selected !== null
            ? 'border-indigo-500/60 cursor-pointer hover:bg-indigo-500/10'
            : 'border-slate-800'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`px-1 rounded border text-[10px] ${TYPE_BADGE[ticket.type]}`}>
          {ticket.type}
        </span>
        <span className="font-bold text-slate-100 truncate flex-1">{ticket.title}</span>
      </div>
      <div className="text-[10px] text-slate-500">
        {module?.name} · spec {ticket.specClarity}% · due d{ticket.deadline}
        {overdue && <span className="text-rose-400 font-bold"> OVERDUE</span>}
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {ticket.stuckInReview && (
        <div className="text-[10px] text-rose-400 font-bold">
          ⚔️ REVIEW WAR — stuck until mediated
        </div>
      )}
      <div className="flex items-center gap-1.5" onClick={(ev) => ev.stopPropagation()}>
        <select
          value={assignee?.id ?? ''}
          onChange={(ev) =>
            onAction((s) =>
              actions.assign(s, ticket.id, ev.target.value ? Number(ev.target.value) : null),
            )
          }
          className="bg-slate-900 border border-slate-700 rounded text-[10px] px-1 py-0.5 flex-1"
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
            className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] hover:bg-sky-500/30"
            title="Write a precise spec (+40 clarity)"
          >
            📝
          </button>
        )}
        {(state.role === 'PO' || state.role === 'CIO') && (
          <button
            onClick={() => onAction((s) => actions.cutScope(s, ticket.id))}
            className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] hover:bg-rose-500/30"
            title="Cut from scope"
          >
            ✂️
          </button>
        )}
        {state.role === 'EM' && (
          <button
            onClick={() => onAction((s) => actions.codeReview(s, ticket.id))}
            className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] hover:bg-cyan-500/30"
            title="Hands-on code review (+5 progress, -10 module debt)"
          >
            🧐
          </button>
        )}
        {ticket.stuckInReview && (
          <button
            onClick={() => onAction((s) => actions.mediate(s, ticket.id))}
            className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] hover:bg-rose-500/30"
            title="Mediate the review war (any role, 1 AP)"
          >
            🕊️
          </button>
        )}
      </div>
    </div>
  );
}

/** The Jira board: Backlog -> In Progress -> Review/QA -> Production. */
export function JiraBoard({ state, selected, onAction }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 min-h-0 flex flex-col">
      <h2 className="text-sm font-bold text-indigo-400 mb-3">
        ACTIVE SPRINT{' '}
        <span className="text-slate-500 font-normal text-xs">
          (select a minion, then click a card to assign)
        </span>
      </h2>
      <div className="flex gap-2 flex-1 min-h-0 overflow-x-auto lg:overflow-visible snap-x">
        {STAGES.map((stage) => {
          const tickets = state.tickets.filter((t) => t.stage === stage.id);
          return (
            <div key={stage.id} className="flex-1 min-w-[13rem] lg:min-w-0 snap-start bg-slate-950/50 rounded-lg border border-slate-800 p-2 flex flex-col min-h-0">
              <div className={`text-[10px] font-bold mb-2 ${stage.color}`}>
                {stage.label} ({tickets.length})
              </div>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {tickets.map((t) => (
                  <TicketCard
                    key={t.id}
                    state={state}
                    ticket={t}
                    selected={selected}
                    onAction={onAction}
                  />
                ))}
                {tickets.length === 0 && (
                  <div className="text-[10px] text-slate-600 text-center mt-4">empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
