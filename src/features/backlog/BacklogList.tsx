import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import BacklogListItem from './BacklogListItem';
import BacklogListItemMinimized from './BacklogListItemMinimized';
import type { BacklogOverviewGameDto } from './types';

export type BacklogViewMode = 'extended' | 'minimized';

interface Props {
  items: BacklogOverviewGameDto[];
  viewMode?: BacklogViewMode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export default function BacklogList({
  items,
  viewMode = 'extended',
  hasActiveFilters = false,
  onClearFilters,
}: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const theme = useTheme();
  const compactColumns = useMediaQuery(theme.breakpoints.down('sm'));
  const cellPaddingSx = compactColumns ? { px: 0.5 } : { px: 1 };

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

  if (viewMode === 'minimized') {
    return (
      <TableContainer sx={{ maxWidth: 1080, overflowX: 'auto' }}>
        <Table size="small" sx={{ bgcolor: 'background.paper' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell align="right" sx={cellPaddingSx}>#</TableCell>
              <TableCell align="right" sx={cellPaddingSx}>Score</TableCell>
              <TableCell sx={cellPaddingSx}></TableCell>
              <TableCell sx={cellPaddingSx}>Game</TableCell>
              {!compactColumns && (
                <>
                  <TableCell sx={cellPaddingSx}>Release</TableCell>
                  <TableCell sx={cellPaddingSx}>In backlog since</TableCell>
                </>
              )}
              <TableCell sx={cellPaddingSx}>Platform</TableCell>
              <TableCell align="center" sx={cellPaddingSx}>Active</TableCell>
              {!compactColumns && <TableCell sx={cellPaddingSx}>Completion</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <BacklogListItemMinimized
                key={item.backlogUid}
                item={item}
                backlogCount={index + 1}
                compactColumns={compactColumns}
                cellPaddingSx={cellPaddingSx}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Stack spacing={0.5} sx={{ maxWidth: 1080 }}>
      {items.map((item, index) => (
        <BacklogListItem
          key={item.backlogUid}
          item={item}
          backlogCount={index + 1}
          expanded={expandedKey === item.gameUid}
          onToggleExpand={() => toggleExpand(item.gameUid)}
        />
      ))}
    </Stack>
  );
}
