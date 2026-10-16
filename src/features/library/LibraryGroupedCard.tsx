import {
  memo,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import CompletionBar from '../shared/CompletionBar';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
import { createGameInstanceReturnState, gameInstanceTo } from '../gameInstances/gameInstanceNavigation';
import { formatPlaytime } from './formatPlaytime';
import {
  aggregateCompletion,
  earliestReleaseDate,
  GroupedLibraryGame,
  isLibraryDlcRow,
  orderedInstanceAndDlcRows,
  pickPrimaryLibraryRow,
  rowCoverUid,
  rowReleaseDate,
} from './groupLibraryRows';
import { LIBRARY_CARD_WIDTH } from './LibraryListItem';
import type { GameOverviewRowDto } from './types';

const CARD_HEIGHT = 325;
const COVER_HEIGHT = 260;
const MOBILE_CARD_HEIGHT = 290;
const MOBILE_COVER_HEIGHT = 220;
const BACK_TITLE_HEIGHT = 44;
const SCROLL_PX_PER_SEC = 14;
const MARQUEE_PX_PER_SEC = 28;

type Props = {
  group: GroupedLibraryGame;
  /** Touch / coarse pointer: flip is click-controlled. */
  isCoarsePointer: boolean;
  flipped?: boolean;
  onToggleFlip?: (gameUid: string) => void;
};

function MarqueeText({
  text,
  variant = 'body2',
  fontWeight = 600,
}: {
  text: string;
  variant?: 'body2' | 'caption';
  fontWeight?: number | string;
}) {
  const marqueeId = useId().replace(/:/g, '');
  const animationName = `libraryGroupedMarquee${marqueeId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const measure = () => {
      const containerWidth = container.clientWidth;
      const textWidth = textEl.scrollWidth;
      const next = Math.ceil(textWidth - containerWidth);
      setOverflowPx(next > 1 ? next : 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(textEl);
    return () => observer.disconnect();
  }, [text]);

  const durationSec =
    overflowPx > 0 ? Math.max(4, (overflowPx * 2) / MARQUEE_PX_PER_SEC + 2.5) : 0;

  return (
    <Box ref={containerRef} sx={{ width: '100%', overflow: 'hidden', minWidth: 0 }}>
      <Typography
        ref={textRef}
        component="span"
        variant={variant}
        fontWeight={fontWeight}
        title={text}
        sx={{
          display: 'inline-block',
          width: 'max-content',
          maxWidth: 'none',
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          ...(overflowPx > 0
            ? {
                animation: `${animationName} ${durationSec}s ease-in-out infinite`,
                [`@keyframes ${animationName}`]: {
                  '0%, 12%': { transform: 'translateX(0)' },
                  '45%, 55%': { transform: `translateX(-${overflowPx}px)` },
                  '88%, 100%': { transform: 'translateX(0)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }
            : undefined),
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function OpenInstanceLink({ to }: { to: { pathname: string; state: unknown } }) {
  return (
    <Tooltip title="Open instance">
      <IconButton
        component={RouterLink}
        to={to}
        size="small"
        aria-label="Open instance"
        onClick={(e) => e.stopPropagation()}
        sx={{ color: 'text.secondary' }}
      >
        <OpenInNewIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );
}

function AutoScrollStack({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const next = content.scrollHeight - container.clientHeight;
      setOverflowPx(next > 1 ? next : 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);

  const durationSec =
    overflowPx > 0 ? Math.max(6, (overflowPx * 2) / SCROLL_PX_PER_SEC + 3) : 0;

  return (
    <Box ref={containerRef} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Box
        ref={contentRef}
        sx={{
          ...(overflowPx > 0
            ? {
                animation: `libraryGroupedInstanceScroll ${durationSec}s ease-in-out infinite`,
                '@keyframes libraryGroupedInstanceScroll': {
                  '0%, 14%': { transform: 'translateY(0)' },
                  '46%, 54%': { transform: `translateY(-${overflowPx}px)` },
                  '86%, 100%': { transform: 'translateY(0)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }
            : undefined),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function InstanceBackSection({
  row,
  resolveStateName,
}: {
  row: GameOverviewRowDto;
  resolveStateName: (uid: string | null) => string | null;
}) {
  const completionStateName = resolveStateName(row.completionStateUid);
  const releaseDate = rowReleaseDate(row);
  const instanceLabel = row.platformName ?? row.instanceName ?? '—';

  return (
    <Box sx={{ py: 1 }}>
      <MarqueeText text={instanceLabel} />
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <DateWithIcon date={releaseDate} tooltip="Release date" variant="caption" />
        {completionStateName ? (
          <CompletionBar
            completionState={completionStateName}
            playthroughState={row.hasActivePlaythrough ? 'Active' : null}
            size="small"
          />
        ) : null}
        {row.inBacklog ? (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
            <CheckBoxIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Backlog
            </Typography>
          </Box>
        ) : null}
        {row.totalPlaytimeSeconds > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Playtime: {formatPlaytime(row.totalPlaytimeSeconds)}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

function DlcBackSection({
  row,
  resolveStateName,
}: {
  row: GameOverviewRowDto;
  resolveStateName: (uid: string | null) => string | null;
}) {
  const completionStateName = resolveStateName(row.completionStateUid);
  const releaseDate = rowReleaseDate(row);
  const dlcName = row.dlcName ?? 'DLC';

  return (
    <Box sx={{ py: 1, pl: 0.5 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
        <Chip
          label="DLC"
          size="small"
          sx={{
            height: 18,
            flexShrink: 0,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: 'grey.800',
            color: 'grey.100',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MarqueeText text={dlcName} />
        </Box>
      </Stack>
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <DateWithIcon date={releaseDate} tooltip="Release date" variant="caption" />
        {completionStateName ? (
          <CompletionBar
            completionState={completionStateName}
            playthroughState={row.hasActivePlaythrough ? 'Active' : null}
            size="small"
          />
        ) : null}
      </Stack>
    </Box>
  );
}

function LibraryGroupedCard({
  group,
  isCoarsePointer,
  flipped = false,
  onToggleFlip,
}: Props) {
  const theme = useTheme();
  const location = useLocation();
  const instanceReturn = createGameInstanceReturnState(location);
  const { referenceData } = useReferenceData();

  const resolveStateName = useCallback(
    (uid: string | null) =>
      referenceData?.data.completionStates.find((c) => c.uid === uid)?.name ?? null,
    [referenceData]
  );

  const instanceRows = useMemo(
    () => group.rows.filter((r) => !isLibraryDlcRow(r)),
    [group.rows]
  );
  const defaultRow = useMemo(
    () => pickPrimaryLibraryRow(group.rows, resolveStateName),
    [group.rows, resolveStateName]
  );
  const coverUid = rowCoverUid(defaultRow);
  const releaseDate = earliestReleaseDate(
    instanceRows.length > 0 ? instanceRows : group.rows
  );
  const { completionStateName, hasActivePlaythrough } = useMemo(
    () => aggregateCompletion(group.rows, resolveStateName),
    [group.rows, resolveStateName]
  );

  const detailTo = defaultRow.gameInstanceUid
    ? gameInstanceTo(defaultRow.gameInstanceUid, instanceReturn)
    : null;

  const showBack = isCoarsePointer ? flipped : false;
  // Mobile: mount heavy back content only while flipped. Desktop keeps it for hover.
  const mountBackContent = !isCoarsePointer || flipped;
  const backBg =
    theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100];

  const displayRows = useMemo(
    () => (mountBackContent ? orderedInstanceAndDlcRows(group.rows) : []),
    [mountBackContent, group.rows]
  );

  const handleClick = useCallback(() => {
    onToggleFlip?.(group.gameUid);
  }, [onToggleFlip, group.gameUid]);

  return (
    <Box
      className="library-grouped-card-root"
      data-library-grouped-card=""
      onClick={isCoarsePointer ? handleClick : undefined}
      sx={{
        width: { xs: 170, sm: LIBRARY_CARD_WIDTH },
        height: { xs: MOBILE_CARD_HEIGHT, sm: CARD_HEIGHT },
        flexShrink: 0,
        perspective: '1000px',
        cursor: isCoarsePointer ? 'pointer' : undefined,
        position: 'relative',
        zIndex: showBack ? 100 : 1,
        overflow: 'visible',
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            zIndex: 100,
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s ease',
          transform: showBack ? 'rotateY(180deg)' : 'none',
          willChange: 'transform',
          '@media (hover: hover) and (pointer: fine)': {
            '.library-grouped-card-root:hover &': {
              transform: 'rotateY(180deg)',
            },
          },
        }}
      >
        {/* Front */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: backBg,
            boxShadow: 1,
            border: 1,
            borderColor: showBack ? 'primary.main' : 'divider',
            display: 'flex',
            flexDirection: 'column',
            transition: (t) =>
              t.transitions.create('border-color', {
                duration: t.transitions.duration.short,
              }),
            '@media (hover: hover) and (pointer: fine)': {
              '.library-grouped-card-root:hover &': {
                borderColor: 'primary.main',
              },
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: MOBILE_COVER_HEIGHT, sm: COVER_HEIGHT },
              flexShrink: 0,
            }}
          >
            <SmartImage
              imageUid={coverUid}
              thumbnail
              alt=""
              aspectRatio={2 / 3}
              fit="contain"
              placeholderLabel={group.gameName}
              sx={{
                width: '100%',
                height: '100%',
                aspectRatio: 'unset',
                borderRadius: 0,
              }}
              imgSx={{ borderRadius: 0 }}
            />
          </Box>

          <Stack
            spacing={0.75}
            sx={{
              p: 1,
              flex: 1,
              minHeight: 0,
              justifyContent: 'center',
            }}
          >
            {releaseDate != null ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <DateWithIcon date={releaseDate} tooltip="Earliest release date" variant="body2" />
              </Box>
            ) : null}
            {completionStateName ? (
              <CompletionBar
                completionState={completionStateName}
                playthroughState={hasActivePlaythrough ? 'Active' : null}
                size="small"
              />
            ) : null}
          </Stack>
        </Box>

        {/* Back — shell always present for 3D; body lazy on mobile */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: backBg,
            boxShadow: 1,
            border: 1,
            borderColor: showBack ? 'primary.main' : 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {mountBackContent ? (
            <>
              <Box
                sx={{
                  flexShrink: 0,
                  px: 1,
                  py: 0.75,
                  minHeight: BACK_TITLE_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <MarqueeText text={group.gameName} fontWeight={700} />
                </Box>
                {detailTo ? <OpenInstanceLink to={detailTo} /> : null}
              </Box>

              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', px: 1 }}>
                <AutoScrollStack>
                  <Stack divider={<Divider flexItem />} spacing={0}>
                    {displayRows.map((row) =>
                      isLibraryDlcRow(row) ? (
                        <DlcBackSection
                          key={row.dlcUid ?? `dlc-${row.gameInstanceUid}-${row.dlcName}`}
                          row={row}
                          resolveStateName={resolveStateName}
                        />
                      ) : (
                        <InstanceBackSection
                          key={row.gameInstanceUid ?? row.gameUid}
                          row={row}
                          resolveStateName={resolveStateName}
                        />
                      )
                    )}
                  </Stack>
                </AutoScrollStack>
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(LibraryGroupedCard);
