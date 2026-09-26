import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../engine/types';
import { SLACK_CHANNELS, SLACK_IDLE, SLACK_ARGUMENTS, SLACK_PANIC } from '../engine/data';

const TEAM_COLOR: Record<string, string> = {
  '#dev-team': 'text-purple-400',
  '#random': 'text-secondary',
  '#incidents': 'text-rose-400',
  '#announcements': 'text-emerald-400',
};

/** Simulated Microsoft Teams: channel pings, read receipts, and the
 * eternal "You have a new message" notification that never stops. */
export function SlackClone({ state }: { state: GameState }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [channel, setChannel] = useState('#all');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.slack.length]);

  const msgs =
    channel === '#all'
      ? state.slack
      : state.slack.filter((m) => m.channel === channel);

  const avgBurnout = Math.round(
    state.engineers.length
      ? state.engineers.reduce((sum, e) => sum + e.burnout, 0) / state.engineers.length
      : 0,
  );

  return (
    <div className="bg-secondary border border-theme rounded-xl p-3 flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">T</div>
        <h2 className="text-sm font-bold text-indigo-400">Microsoft Teams</h2>
        <span className="text-[10px] text-muted ml-auto">🔔 47 unread</span>
      </div>

      {/* Channel selector */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 flex-nowrap">
        {['#all', ...SLACK_CHANNELS].map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className={`px-2 py-1 rounded text-[10px] border flex-shrink-0 ${
              channel === c
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'border-theme text-muted hover:border-theme'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1 min-h-0">
        {msgs.slice(-60).map((m) => (
          <div key={m.id}>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${TEAM_COLOR[m.channel] ?? 'text-secondary'}`}>
                @{m.author}
              </span>
              <span className="text-muted text-[9px]">{m.channel} · d{m.day}</span>
              <span className="text-muted text-[8px]">✓✓</span>
            </div>
            <div className="text-secondary ml-0 mt-0.5">{m.text}</div>
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="text-muted text-center mt-8">no messages</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Burnout bar + Teams footer */}
      <div className="border-t border-theme pt-3 mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-secondary">Team Burnout</span>
          <span className={`text-xs font-bold ${avgBurnout > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
            {avgBurnout}%
          </span>
        </div>
        <div className="w-full bg-tertiary h-2 rounded-full overflow-hidden">
          <div
            className={`h-full bg-rose-500 transition-all duration-700 ${avgBurnout > 60 ? 'animate-pulse' : ''}`}
            style={{ width: `${avgBurnout}%` }}
          />
        </div>
        <div className="text-[9px] text-muted mt-1 text-center">
          You have a new message · You have a new message · You have a new message
        </div>
      </div>
    </div>
  );
}
