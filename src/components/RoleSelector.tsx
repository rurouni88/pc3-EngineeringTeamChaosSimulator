// RoleSelector — swipeable carousel on mobile, side-by-side cards on desktop.
// Pure React + CSS transforms. No carousel library needed.

import { useState, useRef, useCallback } from 'react';
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

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; glow: string; dot: string }> = {
  cyan: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    glow: 'hover:border-cyan-500/70 hover:bg-cyan-500/15',
    dot: 'bg-cyan-400',
  },
  amber: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'hover:border-amber-500/70 hover:bg-amber-500/15',
    dot: 'bg-amber-400',
  },
  emerald: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'hover:border-emerald-500/70 hover:bg-emerald-500/15',
    dot: 'bg-emerald-400',
  },
};

function RoleCard({ role, onStart }: { role: RoleInfo; onStart: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLOR_MAP[role.color];

  return (
    <button
      onClick={() => (expanded ? onStart() : setExpanded(true))}
      className={`w-full h-full text-left rounded-xl border transition-all duration-200 flex flex-col ${
        expanded
          ? `${colors.border} ${colors.bg} ring-1 ${colors.border}`
          : 'border-theme bg-secondary/80 hover:border-theme'
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <span className="text-3xl flex-shrink-0">{role.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base ${expanded ? colors.text : 'text-primary'}`}>
            {role.title}
          </div>
          <div className="text-xs text-muted">{role.desc}</div>
        </div>
        <span className={`text-xs flex-shrink-0 ${expanded ? colors.text : 'text-muted'}`}>
          {expanded ? '▶ PLAY' : '▶'}
        </span>
      </div>

      {expanded && (
        <div className={`mx-4 mb-4 mt-1 p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
          <div className="flex flex-wrap gap-1.5">
            {role.tools.map((tool) => (
              <span key={tool} className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors.text} ${colors.bg}`}>
                {tool}
              </span>
            ))}
          </div>
          <div className="text-center mt-2">
            <span className={`text-xs font-bold ${colors.text}`}>Tap to start</span>
          </div>
        </div>
      )}
    </button>
  );
}

export function RoleSelector({ onStart }: { onStart: (role: Role) => void }) {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    // Rubber-band at edges
    const atStart = index === 0 && dx > 0;
    const atEnd = index === ROLES.length - 1 && dx < 0;
    setDragOffset(atStart || atEnd ? dx * 0.3 : dx);
  }, [dragging, index]);

  const handleTouchEnd = useCallback(() => {
    if (!dragging) return;
    const dx = dragOffset;
    setDragOffset(0);
    setDragging(false);

    if (dx < -SWIPE_THRESHOLD && index < ROLES.length - 1) {
      setIndex(index + 1);
    } else if (dx > SWIPE_THRESHOLD && index > 0) {
      setIndex(index - 1);
    }
  }, [dragging, dragOffset, index]);

  // Desktop: show all cards side by side
  return (
    <div className="w-full max-w-md">
      {/* Mobile: swipeable carousel */}
      <div className="lg:hidden">
        <div
          ref={containerRef}
          className="overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(-${index * 100}% + ${dragOffset}px))`,
              transition: dragging ? 'none' : undefined,
            }}
          >
            {ROLES.map((r) => (
              <div key={r.id} className="w-full flex-shrink-0 px-1">
                <RoleCard role={r} onStart={() => onStart(r.id)} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {ROLES.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? `${COLOR_MAP[r.color].dot} scale-125` : 'bg-tertiary'
              }`}
              aria-label={`Go to ${r.title}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: all cards side by side */}
      <div className="hidden lg:grid grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <RoleCard key={r.id} role={r} onStart={() => onStart(r.id)} />
        ))}
      </div>
    </div>
  );
}
