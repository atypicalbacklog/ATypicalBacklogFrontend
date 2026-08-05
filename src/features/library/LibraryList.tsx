import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { GameOverviewRowDto } from './types';
import LibraryListItem, { LIBRARY_CARD_WIDTH } from './LibraryListItem';
import LibraryListItemMinimized from './LibraryListItemMinimized';
import LibraryGroupedCard from './LibraryGroupedCard';
import { groupLibraryRows, pickPrimaryLibraryRow } from './groupLibraryRows';

export type LibraryViewMode = 'extended' | 'minimized';

type Props = {
  items: GameOverviewRowDto[];
  viewMode?: LibraryViewMode;
  groupedCards?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

export default function LibraryList({
  items,
  viewMode = 'extended',
  groupedCards = false,
  hasActiveFilters = false,
  onClearFilters,
}: Props) {
  const isCoarsePointer = useMediaQuery('(hover: none), (pointer: coarse)');
  const { referenceData } = useReferenceData();
  const [flippedGameUid, setFlippedGameUid] = useState<string | null>(null);

  const groupedItems = useMemo(
    () => (groupedCards ? groupLibraryRows(items) : []),
    [groupedCards, items]
  );

  const groupedPrimaryRows = useMemo(() => {
    if (!groupedCards || viewMode !== 'minimized') return [];
    const resolveStateName = (uid: string | null) =>
      referenceData?.data.completionStates.find((c) => c.uid === uid)?.name ?? null;
    return groupedItems.map((group) => ({
      gameUid: group.gameUid,
      row: pickPrimaryLibraryRow(group.rows, resolveStateName),
      tooltipName: group.gameName,
    }));
  }, [groupedCards, viewMode, groupedItems, referenceData]);

  useEffect(() => {
    setFlippedGameUid(null);
  }, [items, viewMode, groupedCards]);

  useEffect(() => {
    if (!isCoarsePointer || !groupedCards || viewMode === 'minimized') return;
    if (!flippedGameUid) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.('[data-library-grouped-card]')) {
        setFlippedGameUid(null);
      }
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isCoarsePointer, groupedCards, viewMode, flippedGameUid]);

  const handleToggleFlip = useCallback((gameUid: string) => {
    setFlippedGameUid((prev) => (prev === gameUid ? null : gameUid));
  }, []);

  if (items.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" gutterBottom>
          {hasActiveFilters
            ? 'No games match your filters.'
            : 'No games in library.'}
        </Typography>
        {hasActiveFilters && onClearFilters && (
          <Button variant="outlined" onClick={onClearFilters} size="small">
            Clear filters
          </Button>
        )}
      </Box>
    );
  }

  if (groupedCards && viewMode === 'minimized') {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 80px))',
          gap: 1.5,
          justifyContent: 'start',
        }}
      >
        {groupedPrimaryRows.map(({ gameUid, row, tooltipName }) => (
          <LibraryListItemMinimized
            key={gameUid}
            item={row}
            tooltipOverride={tooltipName}
          />
        ))}
      </Box>
    );
  }

  if (groupedCards) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: `repeat(auto-fill, minmax(${LIBRARY_CARD_WIDTH}px, ${LIBRARY_CARD_WIDTH}px))`,
          },
          gap: 1,
          justifyContent: 'start',
          isolation: 'isolate',
          overflow: 'visible',
        }}
      >
        {groupedItems.map((group) => (
          <LibraryGroupedCard
            key={group.gameUid}
            group={group}
            isCoarsePointer={isCoarsePointer}
            flipped={flippedGameUid === group.gameUid}
            onToggleFlip={handleToggleFlip}
          />
        ))}
      </Box>
    );
  }

  if (viewMode === 'minimized') {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 80px))',
          gap: 1.5,
          justifyContent: 'start',
        }}
      >
        {items.map((item) => (
          <LibraryListItemMinimized
            key={item.gameInstanceUid ?? `game-${item.gameUid}`}
            item={item}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: `repeat(auto-fill, minmax(${LIBRARY_CARD_WIDTH}px, ${LIBRARY_CARD_WIDTH}px))`,
        },
        gap: 1,
        justifyContent: 'start',
      }}
    >
      {items.map((item) => (
        <LibraryListItem
          key={item.gameInstanceUid ?? `game-${item.gameUid}`}
          item={item}
        />
      ))}
    </Box>
  );
}
