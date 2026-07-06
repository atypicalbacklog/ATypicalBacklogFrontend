import { useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

const VELOCITY_DECAY = 0.92;
const DRAG_VELOCITY_SCALE = 0.35;
const SWIPE_BOOST = 2.5;
const DRAG_START_PX = 8;

export type ScrollDirection = 'left' | 'right';

interface Props {
  children: ReactNode;
  scrollDurationS: number;
  gap: number;
  /** Auto-scroll direction; drag still follows pointer. */
  direction?: ScrollDirection;
}

/**
 * Infinite horizontal strip: auto-scrolls left; drag/swipe shifts position and adds momentum.
 * Pointer capture starts only after drag threshold so taps on cards still work.
 */
export default function InfiniteScrollTrack({
  children,
  scrollDurationS,
  gap,
  direction = 'left',
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const halfWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const rafRef = useRef(0);

  const measureHalfWidth = () => {
    const track = trackRef.current;
    if (!track) return;
    halfWidthRef.current = track.scrollWidth / 2;
  };

  useLayoutEffect(() => {
    measureHalfWidth();
  }, [children]);

  useEffect(() => {
    const ro = new ResizeObserver(measureHalfWidth);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      const half = halfWidthRef.current;

      if (half > 0 && !draggingRef.current) {
        const baseSpeed = half / (scrollDurationS * 1000);
        const scrollDelta = baseSpeed * dt * (direction === 'right' ? 1 : -1);
        offsetRef.current += scrollDelta;
        offsetRef.current += velocityRef.current * dt;
        velocityRef.current *= Math.pow(VELOCITY_DECAY, dt / 16);

        if (Math.abs(velocityRef.current) < 0.02) {
          velocityRef.current = 0;
        }

        while (offsetRef.current <= -half) offsetRef.current += half;
        while (offsetRef.current > 0) offsetRef.current -= half;

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrollDurationS, direction]);

  const applyDragDelta = (dx: number, dt: number) => {
    offsetRef.current += dx;
    const half = halfWidthRef.current;
    if (half > 0) {
      while (offsetRef.current <= -half) offsetRef.current += half;
      while (offsetRef.current > 0) offsetRef.current -= half;
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
    if (dt > 0) {
      const instantVelocity = (dx / dt) * DRAG_VELOCITY_SCALE * SWIPE_BOOST;
      velocityRef.current = instantVelocity;
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    pointerActiveRef.current = true;
    draggingRef.current = false;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActiveRef.current || e.pointerId !== pointerIdRef.current) return;

    const dxFromStart = e.clientX - startXRef.current;
    if (!draggingRef.current) {
      if (Math.abs(dxFromStart) < DRAG_START_PX) return;
      draggingRef.current = true;
      viewportRef.current?.setPointerCapture(e.pointerId);
    }

    const now = performance.now();
    const dx = e.clientX - lastPointerXRef.current;
    const dt = now - lastPointerTimeRef.current;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
    applyDragDelta(dx, dt);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerActiveRef.current = false;
    draggingRef.current = false;
    pointerIdRef.current = null;
    if (viewportRef.current?.hasPointerCapture(e.pointerId)) {
      viewportRef.current.releasePointerCapture(e.pointerId);
    }
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
        touchAction: 'pan-y',
        cursor: 'grab',
        userSelect: 'none',
        mx: -0.5,
        px: 0.5,
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box
        ref={trackRef}
        sx={{
          display: 'flex',
          gap,
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
