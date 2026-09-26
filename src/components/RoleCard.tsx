// RoleCard — compact role selection card with hover tooltip.

import { Tooltip } from './Tooltip';
import type { Role } from '../engine/types';

interface RoleInfo {
  id: Role;
  title: string;
  emoji: string;
  desc: string;
  tools: string;
}

export function RoleCard({ role, onStart }: { role: RoleInfo; onStart: () => void }) {
  return (
    <Tooltip content={role.tools} placement="top" offset={8}>
      <button
        onClick={onStart}
        className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 w-full"
      >
        <span className="text-3xl">{role.emoji}</span>
        <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
          {role.title}
        </span>
        <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
          {role.desc}
        </span>
      </button>
    </Tooltip>
  );
}
