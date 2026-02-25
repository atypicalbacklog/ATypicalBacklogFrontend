import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LibraryFilterState } from './types';
import { useLibraryQuery } from './useLibraryQuery';
import LibraryFilters from './LibraryFilters';
import LibraryList from './LibraryList';
import {
  filtersToSearchParams,
  hasActiveFilters,
  searchParamsToFilters,
} from './urlFilters';

const initialFilters: LibraryFilterState = {
  searchText: '',
  platformUids: [],
  consoleUids: [],
  inBacklog: null,
  hasActivePlaythrough: null,
  completionStateUids: [],
  playthroughTypeUids: [],
  includeDlc: true,
  onlyGamesWithDlc: null,
  sortMode: 'NAME_ASC',
};

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() =>
    searchParamsToFilters(searchParams, initialFilters)
  );

  useEffect(() => {
    setFilters(searchParamsToFilters(searchParams, initialFilters));
  }, [searchParams]);

  // state → URL (user interaction)
  useEffect(() => {
    setSearchParams(filtersToSearchParams(filters), {
      replace: true,
    });
  }, [filters, setSearchParams]);

  const { data, isLoading, error } = useLibraryQuery(filters);
  const filtersApplied = hasActiveFilters(filters, initialFilters);

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <Typography variant="h4">
          Library
        </Typography>
        <Tooltip title="Add new Game/DLC">
          <IconButton
            component={Link}
            to="/games"
            aria-label="Add new Game/DLC"
            sx={(theme) => ({
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            })}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <LibraryFilters value={filters} onChange={setFilters} />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Stack alignItems="center" mt={4}>
          <CircularProgress />
        </Stack>
      )}

      {!isLoading && !error && (
        <LibraryList
          items={data}
          hasActiveFilters={filtersApplied}
          onClearFilters={() => setFilters(initialFilters)}
        />
      )}
    </Box>
  );
}
