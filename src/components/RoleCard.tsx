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
        className="group flex flex-col items-center gap-3 min-h-[120px] p-5 rounded-xl border border-theme bg-secondary/80 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 w-full"
      >
        <span className="text-4xl">{role.emoji}</span>
        <span className="text-base font-bold text-primary group-hover:text-cyan-300 transition-colors">
          {role.title}
        </span>
        <span className="text-xs text-muted group-hover:text-secondary transition-colors text-center">
          {role.desc}
        </span>
      </button>
    </Tooltip>
  );
}
