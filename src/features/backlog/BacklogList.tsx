import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import BacklogListItem from './BacklogListItem';
import type { BacklogOverviewGameDto } from './types';

interface Props {
  items: BacklogOverviewGameDto[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export default function BacklogList({
  items,
  hasActiveFilters = false,
  onClearFilters,
}: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (gameUid: string) => {
    setExpandedKey((k) => (k === gameUid ? null : gameUid));
  };

  if (items.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography color="text.secondary" gutterBottom>
          {hasActiveFilters
            ? 'No backlog entries match your filters.'
            : 'No games in backlog.'}
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
        <BacklogListItem
          key={item.backlogUid}
          item={item}
          expanded={expandedKey === item.gameUid}
          onToggleExpand={() => toggleExpand(item.gameUid)}
        />
      ))}
    </Stack>
  );
}
