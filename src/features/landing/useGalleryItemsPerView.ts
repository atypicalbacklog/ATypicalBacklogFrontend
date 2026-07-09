import { useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';

/**
 * How many fixed-width cards fit in the gallery row for the current container width.
 */
export function useGalleryItemsPerView(
  cardWidth: number,
  gapSpacing: number,
  fallback: number
): { itemsPerView: number; measureRef: React.RefObject<HTMLDivElement> } {
  const theme = useTheme();
  const measureRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(fallback);

  useLayoutEffect(() => {
    const gapPx = parseFloat(theme.spacing(gapSpacing));

    const measure = () => {
      const el = measureRef.current;
      if (!el) return;
      const available = el.clientWidth;
      if (available <= 0) return;
      const count = Math.max(1, Math.floor((available + gapPx) / (cardWidth + gapPx)));
      setItemsPerView(count);
    };

    measure();
    const ro = new ResizeObserver(measure);
    const el = measureRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [cardWidth, gapSpacing, theme]);

  return { itemsPerView, measureRef };
}
