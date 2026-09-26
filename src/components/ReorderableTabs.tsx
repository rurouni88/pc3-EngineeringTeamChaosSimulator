import { useState, useRef, useCallback } from 'react';

interface DragState {
  index: number | null;
  startX: number;
  currentIndex: number;
}

export function ReorderableTabs({
  tabs,
  activeTab,
  onTabSelect,
  onReorder,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabSelect: (id: string) => void;
  onReorder: (order: string[]) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [longPress, setLongPress] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    timerRef.current = setTimeout(() => {
      setLongPress(true);
      setDrag({ index, startX: touch.clientX, currentIndex: index });
    }, 400);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!longPress || !drag || !touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      clearTimeout(timerRef.current!);
      timerRef.current = null;
    }
  }, [longPress, drag]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (!longPress) {
        const idx = drag?.index;
        if (idx !== null && typeof idx === 'number' && tabs[idx]) onTabSelect(tabs[idx].id);
      }
      setLongPress(false);
      setDrag(null);
      touchStartRef.current = null;
      return;
    }
    if (!drag) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - drag.startX;
    const threshold = 40;
    if (Math.abs(dx) > threshold) {
      const direction = dx > 0 ? 1 : -1;
      const newIndex = drag.currentIndex + direction;
      if (newIndex >= 0 && newIndex < tabs.length) {
        const order = [...tabs.map((t) => t.id)];
        const [item] = order.splice(drag.currentIndex, 1);
        order.splice(newIndex, 0, item);
        onReorder(order);
      }
    }
    setLongPress(false);
    setDrag(null);
    touchStartRef.current = null;
  }, [drag, longPress, tabs, onTabSelect, onReorder]);

  return (
    <div className="flex gap-1 p-2">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          onTouchStart={(e) => handleTouchStart(i, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => onTabSelect(t.id)}
          style={{
            transform: drag?.index === i ? 'scale(1.05) translateY(-4px)' : undefined,
            boxShadow: drag?.index === i ? '0 8px 16px rgba(0,0,0,0.3)' : undefined,
          }}
          className={`flex-1 px-2 py-1.5 rounded-lg text-xs border transition-transform ${
            activeTab === t.id
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
              : 'border-slate-800 text-slate-500'
          } ${longPress ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
