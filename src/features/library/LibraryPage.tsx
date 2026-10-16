import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  FormControl,
  IconButton,
  LinearProgress,
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
import { isManagementMode, isPublicMode } from '../../app/AppConfig';
import { LibraryFilterState, SortMode } from './types';
import { useLibraryQuery } from './useLibraryQuery';
import LibraryFilters from './LibraryFilters';
import LibraryList, { type LibraryViewMode } from './LibraryList';
import { duplicatedInstanceCount } from './groupLibraryRows';
import { useGroupedLibraryCards } from './useGroupedLibraryCards';
import {
  filtersToSearchParams,
  hasActiveFilters,
  libraryFiltersEqual,
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
  filterMode: 'PLAYED',
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
  const [groupedCards, setGroupedCards] = useGroupedLibraryCards();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const filtersContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next = searchParamsToFilters(searchParams, initialFilters);
    // Public has no Include DLC control; never keep a sticky includeDlc=false from the URL.
    if (isPublicMode()) {
      next.includeDlc = true;
    }
    setFilters((prev) => (libraryFiltersEqual(prev, next) ? prev : next));
  }, [searchParams]);

  // state → URL (user interaction)
  useEffect(() => {
    const nextParams = filtersToSearchParams(filters);
    if (nextParams.toString() === searchParams.toString()) return;
    setSearchParams(nextParams, { replace: true });
  }, [filters, searchParams, setSearchParams]);

  // Grouped flip-side lists need DLC rows; public always includes them.
  const queryFilters = useMemo<LibraryFilterState>(
    () => ({
      ...filters,
      includeDlc: isPublicMode() || groupedCards ? true : filters.includeDlc,
    }),
    [filters, groupedCards]
  );

  const { data, counts, isLoading, error } = useLibraryQuery(queryFilters);
  const filtersApplied = hasActiveFilters(filters, initialFilters);
  const duplicatedCount = duplicatedInstanceCount(data);
  const instanceCountLabel = isLoading
    ? 'Updating results…'
    : groupedCards
      ? `${counts?.gameCount ?? 0} Games found, ${duplicatedCount} Duplicated Instances`
      : `${counts?.gameInstanceCount ?? 0} Instances found`;
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
                bgcolor: theme.palette.action.hover,
                border: 1,
                borderColor: 'divider',
                position: 'fixed',
                right: theme.spacing(1),
                bottom: '20vh',
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
        alignItems="center"
        sx={{ ...centeredFitContentColumnSx, mb: 0.5, gap: { xs: 0.75, sm: 1 }, width: '100%', maxWidth: '100%' }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: { xs: 1, sm: 1 }, width: '100%', justifyContent: 'center' }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            <Switch
              checked={viewMode === 'minimized'}
              onChange={(e) => setViewMode(e.target.checked ? 'minimized' : 'extended')}
              color="primary"
            />
            <Typography variant="body2" color={viewMode === 'extended' ? 'text.primary' : 'text.secondary'}>
              Extended
            </Typography>
            <Typography variant="body2">/</Typography>
            <Typography variant="body2" color={viewMode === 'minimized' ? 'text.primary' : 'text.secondary'}>
              Minimized
            </Typography>
          </Stack>

          {isManagementMode() ? (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                ml: { xs: 0, sm: 2 },
                pl: { xs: 0, sm: 1.5 },
                borderLeft: { xs: 0, sm: 2 },
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
              <Switch
                checked={groupedCards}
                onChange={(e) => setGroupedCards(e.target.checked)}
                color="primary"
                size="small"
              />
              <Typography variant="body2" color={groupedCards ? 'text.primary' : 'text.secondary'}>
                Grouped cards
              </Typography>
            </Box>
          ) : null}

          <FormControl
            size="small"
            sx={{
              minWidth: 130,
              ml: { xs: 0, sm: 2 },
              pl: { xs: 0, sm: 1.5 },
              borderLeft: { xs: 0, sm: 2 },
              borderColor: (theme) =>
                alpha(
                  theme.palette.mode === 'dark'
                    ? theme.palette.common.white
                    : theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.58 : 0.38
                ),
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

          {!isMobile ? (
            <Tooltip
              title={
                <Typography variant="caption" component="div" sx={{ whiteSpace: 'pre-line' }}>
                  {countsTooltip}
                </Typography>
              }
            >
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
          ) : null}
        </Stack>

        {isMobile ? (
          <Tooltip
            title={
              <Typography variant="caption" component="div" sx={{ whiteSpace: 'pre-line' }}>
                {countsTooltip}
              </Typography>
            }
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {instanceCountLabel}
            </Typography>
          </Tooltip>
        ) : null}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <LinearProgress
          sx={{
            mb: 1.5,
            height: 4,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        />
      ) : (
        <Box sx={{ mb: 1.5, height: 4 }} aria-hidden />
      )}

      {isLoading && data.length === 0 && !error ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6, gap: 2 }}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading library…
          </Typography>
        </Stack>
      ) : null}

      {!error && data.length > 0 ? (
        <Box sx={{ position: 'relative', minHeight: isLoading ? 120 : undefined }}>
          {isLoading ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: 4,
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(0,0,0,0.35)'
                    : 'rgba(255,255,255,0.45)',
                pointerEvents: 'none',
              }}
            >
              <Stack alignItems="center" spacing={1.5}>
                <CircularProgress size={44} thickness={4} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Updating results…
                </Typography>
              </Stack>
            </Box>
          ) : null}
          <Box
            sx={{
              opacity: isLoading ? 0.45 : 1,
              transition: 'opacity 0.15s ease',
              pointerEvents: isLoading ? 'none' : 'auto',
            }}
          >
            <LibraryList
              key={`${viewMode}-${groupedCards ? 'grouped' : 'flat'}`}
              items={data}
              viewMode={viewMode}
              groupedCards={groupedCards}
              hasActiveFilters={filtersApplied}
              onClearFilters={() => setFilters(initialFilters)}
            />
          </Box>
        </Box>
      ) : null}

      {!isLoading && !error && data.length === 0 ? (
        <LibraryList
          key={`${viewMode}-${groupedCards ? 'grouped' : 'flat'}-empty`}
          items={data}
          viewMode={viewMode}
          groupedCards={groupedCards}
          hasActiveFilters={filtersApplied}
          onClearFilters={() => setFilters(initialFilters)}
        />
      ) : null}

      {!isMobile && showBackToTop && (
        <Tooltip title="Back to Top">
          <Fab
            color="primary"
            variant="extended"
            aria-label="Back to Top"
            onClick={handleBackToTop}
            sx={{
              position: 'fixed',
              right: { md: 16, lg: 24 },
              bottom: '20vh',
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
