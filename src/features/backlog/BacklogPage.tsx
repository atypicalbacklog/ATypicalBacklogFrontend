import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  const gameCount =
    !isLoading && !error
      ? `${data.length} ${data.length === 1 ? 'Game' : 'Games'} in Backlog`
      : null;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        Backlog
      </Typography>

      <BacklogFilters value={filters} onChange={setFilters} />

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
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
              {gameCount != null && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    ml: 3,
                    pl: 1.5,
                    borderLeft: 2,
                    borderColor: (theme) =>
                      alpha(
                        theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.common.black,
                        theme.palette.mode === 'dark' ? 0.58 : 0.38
                      ),
                    minHeight: 22,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {gameCount}
                  </Typography>
                </Box>
              )}
            </Stack>
          }
        />
      </Box>

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
          key={viewMode}
          items={data}
          viewMode={viewMode}
          hasActiveFilters={filtersApplied}
          onClearFilters={() => setFilters(initialFilters)}
        />
      )}
    </Box>
  );
}
