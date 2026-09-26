// HelpModal — game rules and how to play.

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-cyan-400 tracking-widest">📖 HOW TO PLAY</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <div className="font-bold text-slate-100 mb-1">🎯 Objective</div>
            <p className="text-slate-400">Survive 30 days (one quarter) with at least 50% system stability. Keep the budget from hitting zero.</p>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">⚡ Action Points</div>
            <p className="text-slate-400">You get 3 AP per day to take actions. Actions refresh each day. Some actions are free (assigning engineers).</p>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">🎫 Tickets</div>
            <p className="text-slate-400">Tickets move through Backlog → In Progress → QA → Production. Assign engineers to tickets to make progress. Higher spec clarity = faster progress.</p>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">👥 Engineers</div>
            <p className="text-slate-400">Each engineer has energy, morale, and burnout. Assign them to tickets to work, but watch their burnout — at 100 they go on forced leave.</p>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">📦 Modules</div>
            <p className="text-slate-400">Each module has health and tech debt. High debt damages health. If health hits 0, the system collapses.</p>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">⚔️ Code Review Wars</div>
            <p className="text-slate-400">When cowboys review perfectionists&apos; PRs, wars erupt. Tickets get stuck — you must mediate to unblock them.</p>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">💀 Game Over Conditions</div>
            <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
              <li>System collapse: stability hits 0</li>
              <li>Bankrupt: budget hits $0</li>
              <li>Day 30 with &lt;50% stability: the board is not impressed</li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-100 mb-1">🎲 Seeded Runs</div>
            <p className="text-slate-400">Use a seed to replay the same run. Edit the seed and start a new game with the same randomness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
