// Tooltip — lightweight, accessible, portal-based tooltip.
// Usage: <Tooltip content="Some text">
//          <button>Hover me</button>
//        </Tooltip>

import { cloneElement, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const TooltipContext = createContext<{
  id: string;
  show: () => void;
  hide: () => void;
} | null>(null);

interface Props {
  content: string;
  children: React.ReactElement;
  /** Position relative to the trigger element */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Offset in pixels from the default position */
  offset?: number;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  offset = 8,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const id = `tooltip-${Math.random().toString(36).slice(2, 8)}`;

  const show = () => setVisible(true);
  const hide = () => {
    setVisible(false);
    setPosition(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const trigger = cloneElement(children, {
    onMouseEnter: () => {
      show();
      children.props.onMouseEnter?.();
    },
    onMouseMove: (e: React.MouseEvent) => {
      handleMouseMove(e);
      children.props.onMouseMove?.(e);
    },
    onMouseLeave: () => {
      hide();
      children.props.onMouseLeave?.();
    },
    onFocus: show,
    onBlur: hide,
    role: 'button',
    tabIndex: children.props.tabIndex ?? 0,
  });

  if (!visible || !position) return trigger;

  // Calculate position based on placement
  const gap = offset;
  let top = position.y - gap;
  let left = position.x;
  let transform = 'translate(-50%, -100%)';

  switch (placement) {
    case 'bottom':
      top = position.y + gap;
      transform = 'translate(-50%, 0%)';
      break;
    case 'left':
      left = position.x - gap;
      top = position.y;
      transform = 'translate(-100%, -50%)';
      break;
    case 'right':
      left = position.x + gap;
      top = position.y;
      transform = 'translate(0%, -50%)';
      break;
  }

  return (
    <>
      {trigger}
      {createPortal(
        <div
          id={id}
          role="tooltip"
          className="fixed z-[100] px-2 py-1 bg-slate-800 border border-slate-600 text-slate-200 text-[10px] rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            top,
            left,
            transform,
          }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}

/** Wrapper for elements that should not trigger tooltips */
export function TooltipTrigger({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {children}
    </div>
  );
}
