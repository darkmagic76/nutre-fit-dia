import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

/** Panel offset in px from its centered position (`null` = centered). */
export interface DragPosition {
  x: number;
  y: number;
}

/** Props spread onto the header drag handle (grab cursor, touch-safe). */
export interface DragHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

/** Margin kept visible so a dragged panel can always be grabbed back. */
const DRAG_MARGIN_PX = 48;

interface GrabState {
  dx: number;
  dy: number;
}

/**
 * Clamp a drag offset so the panel stays reachable: at most half the
 * viewport minus a grab margin on each axis. Pure — unit-tested directly.
 */
export function clampDragOffset(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
): DragPosition {
  const maxX = Math.max(0, viewportWidth / 2 - DRAG_MARGIN_PX);
  const maxY = Math.max(0, viewportHeight / 2 - DRAG_MARGIN_PX);
  return {
    x: Math.min(Math.max(x, -maxX), maxX),
    y: Math.min(Math.max(y, -maxY), maxY),
  };
}

/**
 * Ephemeral View-layer drag state (pointer events cover mouse + touch).
 * Handlers attach ONLY to the header handle element, so inner
 * buttons/scroll never start a drag. Panel stays centered until moved.
 */
export function useDraggablePanel() {
  const [position, setPosition] = useState<DragPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef<DragPosition>({ x: 0, y: 0 });
  const grabRef = useRef<GrabState | null>(null);

  const handleMove = useCallback((event: PointerEvent) => {
    const grab = grabRef.current;
    if (grab === null) return;
    const next = clampDragOffset(
      event.clientX - grab.dx,
      event.clientY - grab.dy,
      window.innerWidth,
      window.innerHeight,
    );
    positionRef.current = next;
    setPosition(next);
  }, []);

  const endDrag = useCallback(() => {
    grabRef.current = null;
    setIsDragging(false);
    window.removeEventListener('pointermove', handleMove);
  }, [handleMove]);

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    },
    [handleMove, endDrag],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const base = positionRef.current;
      grabRef.current = { dx: event.clientX - base.x, dy: event.clientY - base.y };
      setIsDragging(true);
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
    },
    [handleMove, endDrag],
  );

  const panelStyle: CSSProperties | undefined =
    position === null ? undefined : { transform: `translate(${position.x}px, ${position.y}px)` };

  return { position, isDragging, panelStyle, dragHandleProps: { onPointerDown } };
}
