import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Box } from '@mui/material';

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
 * Infinite horizontal strip when content overflows the viewport; otherwise a static centered row.
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

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const [scrollable, setScrollable] = useState(false);

  const measureOverflow = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const viewportWidth = viewport.clientWidth;
    const singleSetWidth = scrollable ? track.scrollWidth / 2 : track.scrollWidth;
    const nextScrollable = singleSetWidth > viewportWidth + 1;

    if (nextScrollable !== scrollable) {
      setScrollable(nextScrollable);
    }

    halfWidthRef.current = nextScrollable ? singleSetWidth : 0;

    if (!nextScrollable) {
      offsetRef.current = 0;
      velocityRef.current = 0;
      track.style.transform = '';
    }
  };

  useLayoutEffect(() => {
    measureOverflow();
  }, [childArray, scrollable, gap]);

  useEffect(() => {
    const ro = new ResizeObserver(measureOverflow);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [scrollable, childArray]);

  useEffect(() => {
    if (!scrollable) return;

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
  }, [scrollDurationS, direction, scrollable]);

  const displayChildren = useMemo(() => {
    if (!scrollable) return childArray;

    const cloneWithKey = (child: ReactNode, key: string) => {
      if (isValidElement(child)) {
        return cloneElement(child as ReactElement, { key });
      }
      return child;
    };

    return [
      ...childArray.map((child, index) => cloneWithKey(child, `scroll-a-${index}`)),
      ...childArray.map((child, index) => cloneWithKey(child, `scroll-b-${index}`)),
    ];
  }, [childArray, scrollable]);

  const applyDragDelta = (dx: number, dt: number) => {
    if (!scrollable) return;

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
    if (!scrollable || e.button !== 0) return;
    pointerActiveRef.current = true;
    draggingRef.current = false;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!scrollable || !pointerActiveRef.current || e.pointerId !== pointerIdRef.current) return;

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
        touchAction: scrollable ? 'pan-y' : undefined,
        cursor: scrollable ? 'grab' : undefined,
        userSelect: scrollable ? 'none' : undefined,
        mx: -0.5,
        px: 0.5,
        display: scrollable ? 'block' : 'flex',
        justifyContent: scrollable ? undefined : 'center',
        '&:active': scrollable ? { cursor: 'grabbing' } : undefined,
      }}
    >
      <Box
        ref={trackRef}
        sx={{
          display: 'flex',
          gap,
          width: scrollable ? 'max-content' : 'auto',
          maxWidth: scrollable ? undefined : '100%',
          willChange: scrollable ? 'transform' : undefined,
        }}
      >
        {displayChildren}
      </Box>
    </Box>
  );
}
