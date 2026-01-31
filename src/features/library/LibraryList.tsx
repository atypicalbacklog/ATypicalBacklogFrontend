import { Box, Button, Stack, Typography } from '@mui/material';
import { GameOverviewRowDto } from './types';
import LibraryListItem from './LibraryListItem';

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
    <Stack spacing={1}>
      {items.map((item) => (
        <LibraryListItem
          key={item.gameInstanceUid ?? `game-${item.gameUid}`}
          item={item}
        />
      ))}
    </Stack>
  );
}
