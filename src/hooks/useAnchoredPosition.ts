import { useLayoutEffect, useState, type RefObject } from 'react';

export interface AnchoredPosition {
  top: number;
  left: number;
}

const EDGE_MARGIN = 8;

/**
 * Positions a `fixed` dropdown (ImportMenu/ExportMenu) just under its
 * trigger button, right-aligned to it — but clamped so it never runs past
 * the viewport's edges. A plain CSS `right: 0` anchor breaks the moment the
 * trigger itself isn't near the screen's right edge (e.g. the "Open" button
 * sitting early in the top bar's button cluster on a narrow phone): a menu
 * wider than the trigger then hangs off the left side. Measuring the real
 * trigger position and clamping avoids that at every width, so the same
 * "right under the button" placement works on mobile too, not just where
 * there happens to be room.
 */
export function useAnchoredPosition(anchorRef: RefObject<HTMLElement | null>, menuWidth: number, gap = 6): AnchoredPosition | null {
  const [pos, setPos] = useState<AnchoredPosition | null>(null);

  useLayoutEffect(() => {
    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const maxLeft = window.innerWidth - menuWidth - EDGE_MARGIN;
      const left = Math.max(EDGE_MARGIN, Math.min(rect.right - menuWidth, maxLeft));
      setPos({ top: rect.bottom + gap, left });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [anchorRef, menuWidth, gap]);

  return pos;
}
