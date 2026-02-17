import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { ReviewsApi } from '../../services/reviewsApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { ReviewSearchResultDto } from '../../types/dto';
import type { SimpleLookupDto } from '../../types/referenceData';
import { getTierColorByIndex } from '../../constants/tierColors';
import TierEntryCard from './TierEntryCard';

/** Single card tier (if all playthroughs share same tier). */
function cardTierUid(card: ReviewSearchResultDto): string | null {
  if (!card.playthroughs.length) return null;
  const first = card.playthroughs[0].tierUid;
  if (!first) return null;
  if (card.playthroughs.every((p) => p.tierUid === first)) return first;
  return null;
}

const DRAG_TYPE = 'application/json';

export default function ManageYearTierlistPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const previousYearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 2 - i);

  const [includeCurrentYear, setIncludeCurrentYear] = useState(true);
  const [includeLastYear, setIncludeLastYear] = useState(true);
  const [selectedPreviousYears, setSelectedPreviousYears] = useState<number[]>([]);
  const [includeActivePlaythroughs, setIncludeActivePlaythroughs] = useState(true);
  const [results, setResults] = useState<ReviewSearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingCard, setDraggingCard] = useState<ReviewSearchResultDto | null>(null);
  const [savingTier, setSavingTier] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    ReviewsApi.searchByYear({
      years: y,
      includeActivePlaythroughs,
    })
      .then(setResults)
      .catch(() => setError('Failed to load review results.'))
      .finally(() => setLoading(false));
  }, [includeCurrentYear, includeLastYear, selectedPreviousYears, includeActivePlaythroughs, years]);

  const unassignedCards = results.filter((c) => !cardTierUid(c));
  const cardsByTier = (tierUid: string) =>
    results.filter((c) => cardTierUid(c) === tierUid);

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

  if (!isLoaded) return null;

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Manage Year Tierlist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeCurrentYear}
              onChange={(e) => setIncludeCurrentYear(e.target.checked)}
            />
          }
          label={String(currentYear)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeLastYear}
              onChange={(e) => setIncludeLastYear(e.target.checked)}
            />
          }
          label={String(lastYear)}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Previous years</InputLabel>
          <Select
            multiple
            value={selectedPreviousYears}
            onChange={(e) => setSelectedPreviousYears(e.target.value as number[])}
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
              onChange={(e) => setIncludeActivePlaythroughs(e.target.checked)}
            />
          }
          label="Include Active"
        />
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
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              mb: 3,
              minHeight: 160,
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
                onEdit={(state) => navigate('/reviews/edit', { state })}
                isDragging={draggingCard === card}
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
                    minHeight: 120,
                    bgcolor: '#000000',
                    borderRadius: 1,
                    mb: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      flexShrink: 0,
                      bgcolor: color,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.15rem',
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
                      gap: 2,
                      p: 2,
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
                        onEdit={(state) => navigate('/reviews/edit', { state })}
                        isDragging={draggingCard === card}
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
