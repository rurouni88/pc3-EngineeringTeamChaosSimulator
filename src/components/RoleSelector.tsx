// RoleSelector — mobile-friendly role selection with expandable cards.
// Tappable cards with clear hierarchy — works great on mobile and desktop.

import { useState } from 'react';
import type { Role } from '../engine/types';

interface RoleInfo {
  id: Role;
  title: string;
  emoji: string;
  desc: string;
  tools: string[];
  color: string;
}

const ROLES: RoleInfo[] = [
  {
    id: 'PO',
    title: 'Product Owner',
    emoji: '📋',
    desc: 'Write specs. Vague specs = broken outcomes.',
    tools: ['Write Specs', 'Add Tickets', 'Cut Scope'],
    color: 'cyan',
  },
  {
    id: 'EM',
    title: 'Eng Manager',
    emoji: '🧯',
    desc: 'Buffer between chaos and humans. Mediate wars.',
    tools: ['1:1s', 'Code Reviews', 'Mediate', 'Guidelines'],
    color: 'amber',
  },
  {
    id: 'CIO',
    title: 'CIO',
    emoji: '💼',
    desc: 'Manage money and people. OKRs on by default.',
    tools: ['Hire', 'Fire', 'Invest', 'Cut Scope'],
    color: 'emerald',
  },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    glow: 'hover:border-cyan-500/70 hover:bg-cyan-500/15',
  },
  amber: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'hover:border-amber-500/70 hover:bg-amber-500/15',
  },
  emerald: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'hover:border-emerald-500/70 hover:bg-emerald-500/15',
  },
};

export function RoleSelector({ onStart }: { onStart: (role: Role) => void }) {
  const [expanded, setExpanded] = useState<Role | null>(null);

  return (
    <div className="w-full max-w-md space-y-2">
      {ROLES.map((r) => {
        const colors = COLOR_MAP[r.color];
        const isExpanded = expanded === r.id;

        return (
          <button
            key={r.id}
            onClick={() => {
              if (isExpanded) {
                onStart(r.id);
              } else {
                setExpanded(r.id);
              }
            }}
            className={`w-full text-left rounded-xl border transition-all duration-200 ${
              isExpanded
                ? `${colors.border} ${colors.bg} ring-1 ${colors.border}`
                : 'border-theme bg-secondary/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3 p-4 min-h-[56px]">
              <span className="text-2xl flex-shrink-0">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm ${isExpanded ? colors.text : 'text-slate-200'}`}>
                  {r.title}
                </div>
                <div className="text-xs text-muted truncate">{r.desc}</div>
              </div>
              <span className={`text-xs flex-shrink-0 ${isExpanded ? colors.text : 'text-slate-600'}`}>
                {isExpanded ? '▶ PLAY' : '▶'}
              </span>
            </div>

            {/* Expanded tools */}
            {isExpanded && (
              <div className={`px-4 pb-4 pt-1 border-t ${colors.border} ${colors.bg}`}>
                <div className="flex flex-wrap gap-1.5">
                  {r.tools.map((tool) => (
                    <span
                      key={tool}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors.text} ${colors.bg}`}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
