import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { ReviewsApi } from '../../services/reviewsApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { ReviewSearchResultDto } from '../../types/dto';
import type { SimpleLookupDto } from '../../types/referenceData';
import { getTierColorByIndex } from '../../constants/tierColors';
import {
  TIER_LIST_CARD_GAP,
  TIER_LIST_ROW_GAP,
  TIER_LIST_ROW_PADDING,
} from '../../constants/tierListLayout';
import TierEntryCard from './TierEntryCard';
import type { EditReviewLocationState } from './EditReviewPage';
import { sortTierlistCardsByName } from './reviewPresentationUtils';

/** Single card tier (if all playthroughs share same tier). */
function cardTierUid(card: ReviewSearchResultDto): string | null {
  if (!card.playthroughs.length) return null;
  const first = card.playthroughs[0].tierUid;
  if (!first) return null;
  if (card.playthroughs.every((p) => p.tierUid === first)) return first;
  return null;
}

const DRAG_TYPE = 'application/json';

function parseBoolParam(raw: string | null, fallback: boolean): boolean {
  if (raw == null || raw === '') return fallback;
  return raw === '1' || raw === 'true';
}

function parsePreviousYearsParam(raw: string | null, allowed: number[]): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((y) => !Number.isNaN(y) && allowed.includes(y));
}

export default function ManageYearTierlistPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const previousYearOptions = useMemo(
    () => Array.from({ length: 10 }, (_, i) => currentYear - 2 - i),
    [currentYear]
  );

  const [includeCurrentYear, setIncludeCurrentYear] = useState(() =>
    parseBoolParam(searchParams.get('current'), true)
  );
  const [includeLastYear, setIncludeLastYear] = useState(() =>
    parseBoolParam(searchParams.get('last'), true)
  );
  const [selectedPreviousYears, setSelectedPreviousYears] = useState<number[]>(() =>
    parsePreviousYearsParam(searchParams.get('previous'), previousYearOptions)
  );
  const [includeActivePlaythroughs, setIncludeActivePlaythroughs] = useState(() =>
    parseBoolParam(searchParams.get('active'), true)
  );
  const [results, setResults] = useState<ReviewSearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingCard, setDraggingCard] = useState<ReviewSearchResultDto | null>(null);
  const [savingTier, setSavingTier] = useState<string | null>(null);

  // Keep local filter state in sync when returning via browser/back with query params.
  useEffect(() => {
    setIncludeCurrentYear(parseBoolParam(searchParams.get('current'), true));
    setIncludeLastYear(parseBoolParam(searchParams.get('last'), true));
    setSelectedPreviousYears(
      parsePreviousYearsParam(searchParams.get('previous'), previousYearOptions)
    );
    setIncludeActivePlaythroughs(parseBoolParam(searchParams.get('active'), true));
  }, [searchParams, previousYearOptions]);

  const syncFiltersToUrl = useCallback(
    (next: {
      includeCurrentYear: boolean;
      includeLastYear: boolean;
      selectedPreviousYears: number[];
      includeActivePlaythroughs: boolean;
    }) => {
      const params = new URLSearchParams();
      params.set('current', next.includeCurrentYear ? '1' : '0');
      params.set('last', next.includeLastYear ? '1' : '0');
      if (next.selectedPreviousYears.length > 0) {
        params.set(
          'previous',
          [...next.selectedPreviousYears].sort((a, b) => b - a).join(',')
        );
      }
      params.set('active', next.includeActivePlaythroughs ? '1' : '0');
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    // Ensure defaults are written once so back-links have a stable query string.
    if (
      searchParams.get('current') == null &&
      searchParams.get('last') == null &&
      searchParams.get('previous') == null &&
      searchParams.get('active') == null
    ) {
      syncFiltersToUrl({
        includeCurrentYear,
        includeLastYear,
        selectedPreviousYears,
        includeActivePlaythroughs,
      });
    }
  }, [
    searchParams,
    includeCurrentYear,
    includeLastYear,
    selectedPreviousYears,
    includeActivePlaythroughs,
    syncFiltersToUrl,
  ]);

  const tiers: SimpleLookupDto[] = (referenceData?.data?.tiers ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const playthroughTypes = referenceData?.data?.playthroughTypes ?? [];
  const playthroughTypeName = (uid: string | null) =>
    uid ? playthroughTypes.find((t) => t.uid === uid)?.name ?? uid : '—';

  const years = useCallback(() => {
    const set = new Set<number>();
    if (includeCurrentYear) set.add(currentYear);
    if (includeLastYear) set.add(lastYear);
    selectedPreviousYears.forEach((y) => set.add(y));
    return Array.from(set).sort((a, b) => b - a);
  }, [includeCurrentYear, includeLastYear, selectedPreviousYears, currentYear, lastYear]);

  useEffect(() => {
    const y = years();
    if (y.length === 0) {
      setResults([]);
      return;
    }
    const key = `manage-tierlist-${y.join(',')}-${includeActivePlaythroughs}`;
    if (!initialFetchBegin(key)) return;
    setLoading(true);
    setError(null);
    ReviewsApi.searchByYear({
      years: y,
      includeActivePlaythroughs,
    })
      .then(setResults)
      .catch(() => setError('Failed to load review results.'))
      .finally(() => {
        setLoading(false);
        initialFetchEnd(key);
      });
  }, [includeCurrentYear, includeLastYear, selectedPreviousYears, includeActivePlaythroughs, years]);

  const openEdit = useCallback(
    (state: EditReviewLocationState) => {
      const qs = searchParams.toString();
      navigate('/reviews/edit', {
        state: {
          ...state,
          tierlistSearch: qs ? `?${qs}` : '',
        } satisfies EditReviewLocationState,
      });
    },
    [navigate, searchParams]
  );

  const unassignedCards = results.filter((c) => !cardTierUid(c));
  const cardsByTier = (tierUid: string) =>
    sortTierlistCardsByName(results.filter((c) => cardTierUid(c) === tierUid));

  const cardKey = (c: ReviewSearchResultDto) =>
    `${c.displayName}:${c.playthroughs.map((p) => p.playthroughUid).join(',')}`;

  const handleDrop = useCallback(
    (tierUid: string, e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_TYPE);
      if (!raw) return;
      let card: ReviewSearchResultDto;
      try {
        const parsed = JSON.parse(raw);
        card = parsed.card;
      } catch {
        return;
      }
      const playthroughUids = card.playthroughs.map((p) => p.playthroughUid);
      const reviewUids = card.playthroughs.map((p) => p.reviewUid).filter(Boolean) as string[];
      if (playthroughUids.length === 0) return;
      const key = cardKey(card);
      setSavingTier(tierUid);
      ReviewsApi.updateTierBulk({
        playthroughUids,
        reviewUids,
        tierUid,
      })
        .then(() => {
          setResults((prev) =>
            prev.map((r) => {
              if (cardKey(r) !== key) return r;
              return {
                ...r,
                playthroughs: r.playthroughs.map((p) => ({ ...p, tierUid })),
              };
            })
          );
        })
        .catch(() => setError('Failed to update tier.'))
        .finally(() => setSavingTier(null));
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const moveCardToTier = useCallback(
    (card: ReviewSearchResultDto, tierUid: string) => {
      const playthroughUids = card.playthroughs.map((p) => p.playthroughUid);
      const reviewUids = card.playthroughs.map((p) => p.reviewUid).filter(Boolean) as string[];
      if (playthroughUids.length === 0) return;
      const key = cardKey(card);
      setSavingTier(tierUid);
      ReviewsApi.updateTierBulk({
        playthroughUids,
        reviewUids,
        tierUid,
      })
        .then(() => {
          setResults((prev) =>
            prev.map((r) => {
              if (cardKey(r) !== key) return r;
              return {
                ...r,
                playthroughs: r.playthroughs.map((p) => ({ ...p, tierUid })),
              };
            })
          );
        })
        .catch(() => setError('Failed to update tier.'))
        .finally(() => setSavingTier(null));
    },
    []
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isLoaded) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Year Tierlist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters: on mobile row1 = this year + last year, row2 = previous years + include active */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeCurrentYear}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIncludeCurrentYear(next);
                  syncFiltersToUrl({
                    includeCurrentYear: next,
                    includeLastYear,
                    selectedPreviousYears,
                    includeActivePlaythroughs,
                  });
                }}
              />
            }
            label={String(currentYear)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeLastYear}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIncludeLastYear(next);
                  syncFiltersToUrl({
                    includeCurrentYear,
                    includeLastYear: next,
                    selectedPreviousYears,
                    includeActivePlaythroughs,
                  });
                }}
              />
            }
            label={String(lastYear)}
          />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <FormControl size="small" sx={{ minWidth: isMobile ? 140 : 200 }}>
            <InputLabel>Previous years</InputLabel>
            <Select
              multiple
              value={selectedPreviousYears}
              onChange={(e) => {
                const next = e.target.value as number[];
                setSelectedPreviousYears(next);
                syncFiltersToUrl({
                  includeCurrentYear,
                  includeLastYear,
                  selectedPreviousYears: next,
                  includeActivePlaythroughs,
                });
              }}
              label="Previous years"
              renderValue={(selected) =>
                selected.length === 0 ? 'None' : selected.sort((a, b) => b - a).join(', ')
              }
            >
              {previousYearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeActivePlaythroughs}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIncludeActivePlaythroughs(next);
                  syncFiltersToUrl({
                    includeCurrentYear,
                    includeLastYear,
                    selectedPreviousYears,
                    includeActivePlaythroughs: next,
                  });
                }}
              />
            }
            label="Include Active"
          />
        </Stack>
      </Stack>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {/* Unassigned cards – horizontal gallery */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Not yet assigned
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: TIER_LIST_CARD_GAP,
              overflowX: 'auto',
              pb: 2,
              mb: 3,
              minHeight: isMobile ? 120 : 160,
              alignItems: 'flex-start',
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 1 },
            }}
          >
            {unassignedCards.map((card, idx) => (
              <TierEntryCard
                key={`${card.displayName}-${card.playthroughs[0]?.playthroughUid ?? idx}`}
                card={card}
                playthroughTypeNames={playthroughTypeName}
                onDragStart={setDraggingCard}
                onEdit={openEdit}
                isDragging={draggingCard === card}
                compact={isMobile}
                tiers={isMobile ? tiers : undefined}
                onMoveToTier={isMobile ? moveCardToTier : undefined}
              />
            ))}
            {unassignedCards.length === 0 && !loading && (
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                No unassigned cards. Select years and run search.
              </Typography>
            )}
          </Box>

          {/* Tier rows */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Tiers
          </Typography>
          <Stack spacing={0}>
            {tiers.map((tier, index) => {
              const cards = cardsByTier(tier.uid);
              const color = getTierColorByIndex(index);
              const isDropTarget = savingTier === tier.uid;
              return (
                <Box
                  key={tier.uid}
                  sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    minHeight: isMobile ? 90 : 120,
                    bgcolor: '#000000',
                    borderRadius: 1,
                    mb: TIER_LIST_ROW_GAP,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: isMobile ? 48 : 80,
                      flexShrink: 0,
                      bgcolor: color,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: isMobile ? '0.875rem' : '1.15rem',
                      fontFamily: 'sans-serif',
                      letterSpacing: 0.3,
                    }}
                  >
                    {tier.name}
                  </Box>
                  <Box
                    onDrop={(e) => handleDrop(tier.uid, e)}
                    onDragOver={handleDragOver}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      gap: TIER_LIST_CARD_GAP,
                      p: TIER_LIST_ROW_PADDING,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      overflowX: 'auto',
                      bgcolor: isDropTarget ? 'action.hover' : 'transparent',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    {cards.map((card, idx) => (
                      <TierEntryCard
                        key={`${card.displayName}-${card.playthroughs[0]?.playthroughUid ?? idx}`}
                        card={card}
                        playthroughTypeNames={playthroughTypeName}
                        onDragStart={setDraggingCard}
                        onEdit={openEdit}
                        isDragging={draggingCard === card}
                        compact={isMobile}
                        tiers={isMobile ? tiers : undefined}
                        onMoveToTier={isMobile ? moveCardToTier : undefined}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Stack>
          {tiers.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No tiers in reference data.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
