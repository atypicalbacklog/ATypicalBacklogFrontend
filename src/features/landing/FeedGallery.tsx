import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import InfiniteScrollTrack from './InfiniteScrollTrack';
import PagedSwipeGallery from './PagedSwipeGallery';
import { yearlyReviewBlurredPanelSx } from '../yearlyReview/yearlyReviewPanelStyles';
import {
  LANDING_CARD_IMAGE_HEIGHT,
  LANDING_FADE_DURATION_MS,
  LANDING_FEED_SECTION_GAP,
  LANDING_PAGE_INTERVAL_MS,
  LANDING_SCROLL_DURATION_S,
} from './landingFeedConstants';

export type FeedGalleryMode = 'scroll' | 'page' | 'fade';

interface Props<T> {
  title: string;
  items: T[];
  mode: FeedGalleryMode;
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T, index: number) => string;
  itemsPerView?: number;
  pageIntervalMs?: number;
  fadeDurationMs?: number;
  scrollDurationS?: number;
  emptyMessage?: string;
  /** When true, render nothing if items is empty (no placeholder section). */
  hideWhenEmpty?: boolean;
  /** Minimum row height when cards include a footer below the image. */
  minCardHeight?: number;
  /** Scroll strip direction (scroll mode only). */
  scrollDirection?: 'left' | 'right';
}

const galleryPanelSx = {
  ...yearlyReviewBlurredPanelSx,
  mb: LANDING_FEED_SECTION_GAP,
  overflow: 'hidden',
};

function GallerySection({
  title,
  children,
  empty,
  emptyMessage,
}: {
  title: string;
  children?: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <Box sx={galleryPanelSx}>
      <Typography
        variant="subtitle1"
        sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}
      >
        {title}
      </Typography>
      {empty ? (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      ) : (
        children
      )}
    </Box>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0 || items.length === 0) return [];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

export default function FeedGallery<T>({
  title,
  items,
  mode,
  renderItem,
  getItemKey,
  itemsPerView: itemsPerViewProp,
  pageIntervalMs = LANDING_PAGE_INTERVAL_MS,
  fadeDurationMs = LANDING_FADE_DURATION_MS,
  scrollDurationS = LANDING_SCROLL_DURATION_S,
  emptyMessage = 'Nothing to show right now.',
  hideWhenEmpty = false,
  minCardHeight,
  scrollDirection = 'left',
}: Props<T>) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));

  const itemsPerView = itemsPerViewProp ?? (isSm ? 2 : isMd ? 4 : 5);
  const gap = 2;

  const pages = useMemo(
    () => (mode === 'scroll' ? [] : chunk(items, itemsPerView)),
    [items, itemsPerView, mode]
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [fadePhase, setFadePhase] = useState<'in' | 'out'>('in');
  const [autoEpoch, setAutoEpoch] = useState(0);

  const handlePageChange = (index: number) => {
    setPageIndex(index);
    setAutoEpoch((e) => e + 1);
  };

  useEffect(() => {
    setPageIndex(0);
    setFadePhase('in');
  }, [items, mode, itemsPerView]);

  useEffect(() => {
    if (mode !== 'page' && mode !== 'fade') return;
    if (pages.length <= 1) return;

    const id = window.setInterval(() => {
      if (mode === 'fade') {
        setFadePhase('out');
        window.setTimeout(() => {
          setPageIndex((prev) => (prev + 1) % pages.length);
          setFadePhase('in');
        }, fadeDurationMs);
      } else {
        setPageIndex((prev) => (prev + 1) % pages.length);
      }
    }, pageIntervalMs);

    return () => window.clearInterval(id);
  }, [mode, pages.length, pageIntervalMs, fadeDurationMs, autoEpoch]);

  const pageItems = pages[pageIndex] ?? [];

  if (items.length === 0) {
    if (hideWhenEmpty) return null;
    return (
      <GallerySection title={title} empty emptyMessage={emptyMessage} />
    );
  }

  if (mode === 'scroll') {
    const trackItems = [...items, ...items];

    return (
      <GallerySection title={title}>
        <InfiniteScrollTrack
          scrollDurationS={scrollDurationS}
          gap={gap}
          direction={scrollDirection}
        >
          {trackItems.map((item, index) => (
            <Box key={`${getItemKey(item, index % items.length)}-${index}`} sx={{ flexShrink: 0 }}>
              {renderItem(item, index % items.length)}
            </Box>
          ))}
        </InfiniteScrollTrack>
      </GallerySection>
    );
  }

  if (mode === 'page') {
    return (
      <GallerySection title={title}>
        <PagedSwipeGallery
          pageIndex={pageIndex}
          pageCount={pages.length}
          onPageChange={handlePageChange}
          gap={gap}
          minCardHeight={minCardHeight}
        >
          {pageItems.map((item, index) => (
            <Box
              key={getItemKey(item, pageIndex * itemsPerView + index)}
              sx={{ flexShrink: 0 }}
            >
              {renderItem(item, pageIndex * itemsPerView + index)}
            </Box>
          ))}
        </PagedSwipeGallery>
      </GallerySection>
    );
  }

  // fade mode – stagger left-to-right
  const staggerMs = Math.max(120, Math.floor(fadeDurationMs / Math.max(itemsPerView, 1)));

  return (
    <GallerySection title={title}>
      <Box
        sx={{
          display: 'flex',
          gap,
          minHeight: minCardHeight ?? LANDING_CARD_IMAGE_HEIGHT,
          overflow: 'hidden',
        }}
      >
        {pageItems.map((item, index) => (
          <Box
            key={getItemKey(item, pageIndex * itemsPerView + index)}
            sx={{
              flexShrink: 0,
              opacity: fadePhase === 'in' ? 1 : 0,
              transform: fadePhase === 'in' ? 'translateX(0)' : 'translateX(-8px)',
              transition: `opacity ${fadeDurationMs}ms ease, transform ${fadeDurationMs}ms ease`,
              transitionDelay: `${index * staggerMs}ms`,
            }}
          >
            {renderItem(item, pageIndex * itemsPerView + index)}
          </Box>
        ))}
      </Box>
    </GallerySection>
  );
}
