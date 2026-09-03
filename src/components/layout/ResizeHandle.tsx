import { useCallback, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import clsx from 'clsx';
import { useUiStore } from '../../store/uiStore';
import { SIDE_PANEL_WIDTH } from '../../lib/storage/storage';

// Keep the editor from being crushed to nothing when the details column is
// dragged wide — independent of SIDE_PANEL_WIDTH.max, which alone can't
// account for how narrow the actual window is.
const EDITOR_MIN_WIDTH = 320;
const KEYBOARD_STEP = 24;

/**
 * The draggable divider between the JSON editor and the details column
 * (Inspector/Tree/Overview) — a thin line the full height of the row with a
 * small grip badge in the middle as the "you can drag this" affordance.
 * Pointer-based (not native HTML5 drag) so it works the same for mouse and
 * touch, with a matching keyboard interaction since it's a real
 * `role="separator"`. Width persists across sessions (uiStore/storage.ts).
 */
export function ResizeHandle() {
  const width = useUiStore((s) => s.sidePanelWidth);
  const setWidth = useUiStore((s) => s.setSidePanelWidth);
  const handleRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startWidth: number; max: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const container = handleRef.current?.parentElement;
      const containerWidth = container?.getBoundingClientRect().width ?? Infinity;
      drag.current = {
        startX: e.clientX,
        startWidth: width,
        max: Math.min(SIDE_PANEL_WIDTH.max, containerWidth - EDITOR_MIN_WIDTH),
      };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return;
      const { startX, startWidth, max } = drag.current;
      // Panel sits to the right of the handle — dragging right (positive
      // delta) narrows it, dragging left widens it.
      const next = startWidth - (e.clientX - startX);
      setWidth(Math.min(max, Math.max(SIDE_PANEL_WIDTH.min, next)));
    },
    [setWidth]
  );

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    setIsDragging(false);
    if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setWidth(Math.min(SIDE_PANEL_WIDTH.max, width + KEYBOARD_STEP));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setWidth(Math.max(SIDE_PANEL_WIDTH.min, width - KEYBOARD_STEP));
      } else if (e.key === 'Home' || e.key === 'Enter') {
        e.preventDefault();
        setWidth(SIDE_PANEL_WIDTH.default);
      }
    },
    [width, setWidth]
  );

  return (
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize details panel"
      aria-valuenow={Math.round(width)}
      aria-valuemin={SIDE_PANEL_WIDTH.min}
      aria-valuemax={SIDE_PANEL_WIDTH.max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => setWidth(SIDE_PANEL_WIDTH.default)}
      onKeyDown={onKeyDown}
      title="Drag to resize · double-click to reset"
      className="hidden md:flex relative h-full w-3 shrink-0 cursor-col-resize touch-none select-none items-center justify-center outline-none group"
    >
      <span
        className={clsx(
          'absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors',
          isDragging ? 'bg-accent' : 'bg-border group-hover:bg-accent group-focus-visible:bg-accent'
        )}
      />
      <span
        className={clsx(
          'relative z-10 flex h-9 w-4 items-center justify-center rounded-full border transition-colors',
          isDragging
            ? 'border-accent/50 bg-accent-muted text-accent-text'
            : 'border-border bg-surface text-text-faint group-hover:border-accent/40 group-hover:text-accent-text group-focus-visible:border-accent/40 group-focus-visible:text-accent-text'
        )}
      >
        <GripVertical size={12} />
      </span>
    </div>
  );
}
