import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../engine/types';
import { SLACK_CHANNELS } from '../engine/data';

const CHANNEL_COLOR: Record<string, string> = {
  '#dev-team': 'text-purple-400',
  '#random': 'text-slate-400',
  '#incidents': 'text-rose-400',
  '#announcements': 'text-emerald-400',
};

/** Simulated team Slack: quirks, arguments, incidents, PM pings. */
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex-1 min-h-0 flex flex-col">
      <h2 className="text-sm font-bold text-pink-400 mb-2">TEAM CHAT</h2>

      {/* Channel selector */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 flex-nowrap">
        {['#all', ...SLACK_CHANNELS].map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className={`px-2 py-1 rounded text-[10px] border flex-shrink-0 ${
              channel === c
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                : 'border-slate-800 text-slate-500 hover:border-slate-600'
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
              <span className={`font-bold ${CHANNEL_COLOR[m.channel] ?? 'text-slate-300'}`}>
                @{m.author}
              </span>
              <span className="text-slate-600 text-[9px]">{m.channel} · d{m.day}</span>
            </div>
            <div className="text-slate-300 ml-0 mt-0.5">{m.text}</div>
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="text-slate-600 text-center mt-8">no messages</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Burnout bar */}
      <div className="border-t border-slate-800 pt-3 mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Team Burnout</span>
          <span className={`text-xs font-bold ${avgBurnout > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
            {avgBurnout}%
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full bg-rose-500 transition-all duration-700 ${avgBurnout > 60 ? 'animate-pulse' : ''}`}
            style={{ width: `${avgBurnout}%` }}
          />
        </div>
      </div>
    </div>
  );
}
