import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import BacklogFilters from './BacklogFilters';
import BacklogList from './BacklogList';
import { useBacklogQuery } from './useBacklogQuery';
import {
  filtersToSearchParams,
  hasActiveFilters,
  searchParamsToFilters,
} from './urlFilters';
import type { BacklogFilterState } from './types';

const initialFilters: BacklogFilterState = {
  searchText: '',
  consoleUids: [],
  platformUids: [],
  hasActivePlaythrough: null,
  completionStateUids: [],
};

export default function BacklogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<BacklogFilterState>(() =>
    searchParamsToFilters(searchParams, initialFilters)
  );

  useEffect(() => {
    setFilters(searchParamsToFilters(searchParams, initialFilters));
  }, [searchParams]);

  useEffect(() => {
    setSearchParams(filtersToSearchParams(filters), { replace: true });
  }, [filters, setSearchParams]);

  const { data, isLoading, error } = useBacklogQuery(filters);
  const filtersApplied = hasActiveFilters(filters, initialFilters);

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <Typography variant="h4">
          Backlog
        </Typography>
        <Button
          component={Link}
          to="/backlog-completion-overview"
          variant="outlined"
          size="small"
        >
          Completion overview
        </Button>
      </Stack>

      <BacklogFilters value={filters} onChange={setFilters} />

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
        <BacklogList
          items={data}
          hasActiveFilters={filtersApplied}
          onClearFilters={() => setFilters(initialFilters)}
        />
      )}
    </Box>
  );
}
