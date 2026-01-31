import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
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
      <Typography variant="h4" gutterBottom>
        Library
      </Typography>

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
