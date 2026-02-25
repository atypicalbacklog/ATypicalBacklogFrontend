import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import BacklogFilters from './BacklogFilters';
import BacklogList, { type BacklogViewMode } from './BacklogList';
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
  const [viewMode, setViewMode] = useState<BacklogViewMode>('extended');

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

      <FormControlLabel
        control={
          <Switch
            checked={viewMode === 'minimized'}
            onChange={(e) => setViewMode(e.target.checked ? 'minimized' : 'extended')}
            color="primary"
          />
        }
        label={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color={viewMode === 'extended' ? 'text.primary' : 'text.secondary'}>
              Extended
            </Typography>
            <Typography variant="body2">/</Typography>
            <Typography variant="body2" color={viewMode === 'minimized' ? 'text.primary' : 'text.secondary'}>
              Minimized
            </Typography>
          </Stack>
        }
        sx={{ mb: 0 }}
      />

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
          viewMode={viewMode}
          hasActiveFilters={filtersApplied}
          onClearFilters={() => setFilters(initialFilters)}
        />
      )}
    </Box>
  );
}
