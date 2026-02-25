import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LibraryFilterState } from './types';
import { useLibraryQuery } from './useLibraryQuery';
import LibraryFilters from './LibraryFilters';
import LibraryList, { type LibraryViewMode } from './LibraryList';
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
  const [viewMode, setViewMode] = useState<LibraryViewMode>('extended');

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
        <LibraryList
          items={data}
          viewMode={viewMode}
          hasActiveFilters={filtersApplied}
          onClearFilters={() => setFilters(initialFilters)}
        />
      )}
    </Box>
  );
}
