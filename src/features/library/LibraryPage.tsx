import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { isManagementMode } from '../../app/AppConfig';
import { LibraryFilterState, SortMode } from './types';
import { useLibraryQuery } from './useLibraryQuery';
import LibraryFilters from './LibraryFilters';
import LibraryList, { type LibraryViewMode } from './LibraryList';
import {
  filtersToSearchParams,
  hasActiveFilters,
  searchParamsToFilters,
} from './urlFilters';
import { centeredFitContentColumnSx } from '../landing/landingLayout';

const initialFilters: LibraryFilterState = {
  searchText: '',
  platformUids: [],
  consoleUids: [],
  ignorePorts: false,
  inBacklog: null,
  hasActivePlaythrough: null,
  completionFilterIntents: [],
  completionStateUids: [],
  playthroughTypeUids: [],
  includeDlc: true,
  onlyGamesWithDlc: null,
  sortMode: 'NAME_ASC',
};

export default function LibraryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() =>
    searchParamsToFilters(searchParams, initialFilters)
  );
  const [viewMode, setViewMode] = useState<LibraryViewMode>('extended');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const filtersContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFilters(searchParamsToFilters(searchParams, initialFilters));
  }, [searchParams]);

  // state → URL (user interaction)
  useEffect(() => {
    setSearchParams(filtersToSearchParams(filters), {
      replace: true,
    });
  }, [filters, setSearchParams]);

  const { data, counts, isLoading, error } = useLibraryQuery(filters);
  const filtersApplied = hasActiveFilters(filters, initialFilters);
  const instanceCountLabel = `${counts?.gameInstanceCount ?? 0} Instances found`;
  const countsTooltip = counts
    ? `Games: ${counts.gameCount}
Game Instances: ${counts.gameInstanceCount}
DLC: ${counts.dlcCount}`
    : 'Counts unavailable';

  useEffect(() => {
    const el = filtersContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBackToTop(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Library</Typography>
        {isManagementMode() ? (
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
        ) : null}
        {isMobile && showBackToTop && (
          <Tooltip title="Back to Top">
            <IconButton
              aria-label="Back to Top"
              onClick={handleBackToTop}
              size="small"
              sx={(theme) => ({
                ml: 'auto',
                bgcolor: theme.palette.action.hover,
                border: 1,
                borderColor: 'divider',
                position: 'fixed',
                top: `calc(${theme.spacing(0.5)} + env(safe-area-inset-top))`,
                right: theme.spacing(0.5),
                p: 0.625,
                zIndex: theme.zIndex.appBar + 2,
                '&:hover': {
                  bgcolor: theme.palette.action.selected,
                },
              })}
            >
              <KeyboardArrowUpIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Box ref={filtersContainerRef} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <LibraryFilters value={filters} onChange={setFilters} />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ ...centeredFitContentColumnSx, mb: 0.5, gap: 1 }}
      >
        <Switch
          checked={viewMode === 'minimized'}
          onChange={(e) => setViewMode(e.target.checked ? 'minimized' : 'extended')}
          color="primary"
        />
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flexWrap: 'wrap' }}>
          <Typography variant="body2" color={viewMode === 'extended' ? 'text.primary' : 'text.secondary'}>
            Extended
          </Typography>
          <Typography variant="body2">/</Typography>
          <Typography variant="body2" color={viewMode === 'minimized' ? 'text.primary' : 'text.secondary'}>
            Minimized
          </Typography>
          <Tooltip title={<Typography variant="caption" component="div" sx={{ whiteSpace: 'pre-line' }}>{countsTooltip}</Typography>}>
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
                {instanceCountLabel}
              </Typography>
            </Box>
          </Tooltip>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              ml: 2,
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
            <FormControl
              size="small"
              sx={{
                minWidth: 130,
                '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem' },
              }}
            >
              <Select
                displayEmpty
                value={filters.sortMode}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortMode: e.target.value as SortMode,
                  }))
                }
              >
                <MenuItem value="NAME_ASC">Name ↑</MenuItem>
                <MenuItem value="NAME_DESC">Name ↓</MenuItem>
                <MenuItem value="PLAYTIME_DESC">Playtime</MenuItem>
                <MenuItem value="LAST_PLAYED_DESC">Last Played</MenuItem>
                <MenuItem value="NEWEST_CREATED">Newest created</MenuItem>
                <MenuItem value="RELEASE_DATE">Release date</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Stack>

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

      {!isMobile && showBackToTop && (
        <Tooltip title="Back to Top">
          <Fab
            color="primary"
            variant="extended"
            aria-label="Back to Top"
            onClick={handleBackToTop}
            sx={{
              position: 'fixed',
              left: { md: 16, lg: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: (t) => t.zIndex.speedDial,
            }}
          >
            <KeyboardArrowUpIcon />
            <Typography variant="button" sx={{ ml: 0.75 }}>
              Back to Top
            </Typography>
          </Fab>
        </Tooltip>
      )}
    </Box>
  );
}
