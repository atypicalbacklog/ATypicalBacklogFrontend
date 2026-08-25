import { useCallback, useEffect, useState } from 'react';
import { yearlyReviewMaxSlotsForWidth } from './yearlyReviewGamePresentationUtils';

export type UseYearlyReviewCategoryMaxSlotsOptions = {
  /** Horizontal space reserved inside the measured container (e.g. edit-row add button). */
  reservedWidthPx?: number;
};

/**
 * Measures a container and returns how many default-card slots fit per category row.
 * Uses a callback ref so measurement attaches when the container mounts after data load.
 */
export function useYearlyReviewCategoryMaxSlots(
  compact: boolean,
  options?: UseYearlyReviewCategoryMaxSlotsOptions
): {
  containerRef: (node: HTMLDivElement | null) => void;
  maxSlots: number;
} {
  const reservedWidthPx = options?.reservedWidthPx ?? 0;
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [maxSlots, setMaxSlots] = useState(() =>
    yearlyReviewMaxSlotsForWidth(0, compact)
  );

  const containerRef = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    const update = (width: number) => {
      setMaxSlots(
        yearlyReviewMaxSlotsForWidth(Math.max(0, width - reservedWidthPx), compact)
      );
    };

    update(node.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? node.clientWidth;
      update(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, compact, reservedWidthPx]);

  return { containerRef, maxSlots };
}
