import { Box, Button, Typography } from '@mui/material';
import { GameOverviewRowDto } from './types';
import LibraryListItem, { LIBRARY_CARD_WIDTH } from './LibraryListItem';

type Props = {
  items: GameOverviewRowDto[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

export default function LibraryList({
  items,
  hasActiveFilters = false,
  onClearFilters,
}: Props) {
  if (items.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${LIBRARY_CARD_WIDTH}px, ${LIBRARY_CARD_WIDTH}px))`,
        gap: 2,
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
