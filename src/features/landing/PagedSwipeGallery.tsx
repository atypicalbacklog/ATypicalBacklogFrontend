import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Box } from '@mui/material';

const DRAG_START_PX = 8;
const SWIPE_THRESHOLD_PX = 56;
const MAX_DRAG_RATIO = 0.45;

interface Props {
  pageIndex: number;
  pageCount: number;
  onPageChange: (index: number) => void;
  gap: number;
  minCardHeight?: number;
  children: ReactNode;
}

/**
 * Single-page viewport with horizontal drag/swipe to change pages (both directions).
 * Pointer capture starts only after drag threshold so taps on cards still work.
 */
export default function PagedSwipeGallery({
  pageIndex,
  pageCount,
  onPageChange,
  gap,
  minCardHeight,
  children,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const dragOffsetRef = useRef(0);

  const canSwipe = pageCount > 1;

  const clampDrag = (offset: number) => {
    const width = viewportRef.current?.clientWidth ?? 0;
    const maxDrag = width * MAX_DRAG_RATIO;
    return Math.max(-maxDrag, Math.min(maxDrag, offset));
  };

  const commitDrag = () => {
    const offset = dragOffsetRef.current;
    let newIndex = pageIndex;

    if (offset < -SWIPE_THRESHOLD_PX) {
      newIndex = (pageIndex + 1) % pageCount;
    } else if (offset > SWIPE_THRESHOLD_PX) {
      newIndex = (pageIndex - 1 + pageCount) % pageCount;
    }

    dragOffsetRef.current = 0;
    draggingRef.current = false;
    setDragOffset(0);
    setIsDragging(false);

    if (newIndex !== pageIndex) {
      onPageChange(newIndex);
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canSwipe || e.button !== 0) return;
    pointerActiveRef.current = true;
    draggingRef.current = false;
    setIsDragging(false);
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActiveRef.current || e.pointerId !== pointerIdRef.current) return;

    const dxFromStart = e.clientX - startXRef.current;
    if (!draggingRef.current) {
      if (Math.abs(dxFromStart) < DRAG_START_PX) return;
      draggingRef.current = true;
      setIsDragging(true);
      viewportRef.current?.setPointerCapture(e.pointerId);
    }

    const next = clampDrag(dxFromStart);
    dragOffsetRef.current = next;
    setDragOffset(next);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerActiveRef.current = false;
    if (viewportRef.current?.hasPointerCapture(e.pointerId)) {
      viewportRef.current.releasePointerCapture(e.pointerId);
    }
    if (draggingRef.current) {
      commitDrag();
    }
    pointerIdRef.current = null;
  };

  return (
    <Box
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      sx={{
        overflow: 'hidden',
        width: '100%',
        touchAction: canSwipe ? 'pan-y' : undefined,
        cursor: canSwipe ? 'grab' : undefined,
        userSelect: canSwipe ? 'none' : undefined,
        ...(minCardHeight != null ? { minHeight: minCardHeight } : {}),
        '&:active': canSwipe ? { cursor: 'grabbing' } : undefined,
      }}
    >
      <Box
        key={pageIndex}
        sx={{
          display: 'flex',
          gap,
          transform: `translate3d(${dragOffset}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 0.28s ease-out',
          animation: isDragging ? 'none' : 'landingPageIn 0.8s ease-out',
          '@keyframes landingPageIn': {
            '0%': { opacity: 0.4, transform: 'translate3d(24px, 0, 0)' },
            '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
