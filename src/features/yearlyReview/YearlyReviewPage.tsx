import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { GameApi } from '../../services/gameApi';
import { YearlyReviewApi, type YearlyReviewDto } from '../../services/yearlyReviewApi';
import { ReviewsApi } from '../../services/reviewsApi';
import {
  fetchYearlyActivity,
  fetchGamePlaytimeRanking,
  fetchConsoleYearActivity,
  fetchConsoleInputStylePlaytime,
  fetchConsoleYearVariantActivity,
  type ConsoleInputStyleDto,
} from '../../services/statisticsApi';
import type { ReviewSearchResultDto } from '../../types/dto';
import type { GamePlaytimeDisplay } from '../statistics/hooks/useGamePlaytimeRanking';
import type { ConsoleYearDisplay } from '../statistics/hooks/useConsoleYearActivity';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { getTierColorByIndex } from '../../constants/tierColors';
import type { SimpleLookupDto } from '../../types/referenceData';
import GamePlaytimeRankingBarChart from '../statistics/charts/GamePlaytimeRankingBarChart';
import ConsolePlaytimePieChart from '../statistics/charts/ConsolePlaytimePieChart';
import PcInputVariantsPieChart from '../statistics/charts/PcInputVariantsPieChart';
import ConsoleVariantPlaytimeStackedBarChart from '../statistics/charts/ConsoleVariantPlaytimeStackedBarChart';
import ConsoleVariantGameCountStackedBarChart from '../statistics/charts/ConsoleVariantGameCountStackedBarChart';
import type { ConsoleVariantPlaytimeRow } from '../statistics/charts/ConsoleVariantPlaytimeStackedBarChart';
import TierEntryCardView from '../reviews/TierEntryCardView';
import YearlyReviewGameCard from './YearlyReviewGameCard';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';

const MIN_YEAR = 2017;
const CURRENT_YEAR = new Date().getFullYear();
const LAST_YEAR = CURRENT_YEAR - 1;
const YEARS = Array.from(
  { length: LAST_YEAR - MIN_YEAR + 1 },
  (_, i) => LAST_YEAR - i
);

function chunkGames<T>(items: T[], maxPerRow: number = 6): T[][] {
  if (items.length === 0) return [];
  const numRows = Math.ceil(items.length / maxPerRow);
  const rows: T[][] = [];
  let remaining = items.length;
  for (let i = 0; i < numRows; i++) {
    const take = Math.ceil(remaining / (numRows - i));
    rows.push(items.slice(rows.flat().length, rows.flat().length + take));
    remaining -= take;
  }
  return rows;
}

function formatTotalPlaytime(totalPlaytimeSeconds: number): string {
  const  totalhours = Math.round(totalPlaytimeSeconds / 3600);
  return `${totalhours} hours`;
}

function cardTierUid(card: ReviewSearchResultDto): string | null {
  if (!card.playthroughs.length) return null;
  const first = card.playthroughs[0].tierUid;
  if (!first) return null;
  if (card.playthroughs.every((p) => p.tierUid === first)) return first;
  return null;
}

export default function YearlyReviewPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const [year, setYear] = useState(LAST_YEAR);
  const [yearlyReview, setYearlyReview] = useState<YearlyReviewDto | null>(null);
  const [tierlistResults, setTierlistResults] = useState<ReviewSearchResultDto[]>([]);
  const [totalPlaytimeSeconds, setTotalPlaytimeSeconds] = useState<number | null>(null);
  const [gameRankingData, setGameRankingData] = useState<GamePlaytimeDisplay[]>([]);
  const [consoleYearData, setConsoleYearData] = useState<ConsoleYearDisplay[]>([]);
  const [consoleVariantData, setConsoleVariantData] = useState<ConsoleVariantPlaytimeRow[]>([]);
  const [pcInputStyleData, setPcInputStyleData] = useState<ConsoleInputStyleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inputName = (inputUid: string) =>
    referenceData?.data.inputs.find((i) => i.uid === inputUid)?.name ?? inputUid;

  const load = useCallback(async () => {
    if (!referenceData) return;
    setLoading(true);
    setError(null);
    try {
      const [review, reviews, yearlyActivityRaw, rankingRaw, consoleRaw, consoleVariantRaw, inputStyleRaw] = await Promise.all([
        YearlyReviewApi.getByYear(year),
        ReviewsApi.searchByYear({ years: [year], includeActivePlaythroughs: true }),
        fetchYearlyActivity(),
        fetchGamePlaytimeRanking({ fromYear: year, toYear: year }),
        fetchConsoleYearActivity(year),
        fetchConsoleYearVariantActivity(year),
        fetchConsoleInputStylePlaytime(year),
      ]);
      setYearlyReview(review);
      setTierlistResults(reviews);
      const yearEntry = yearlyActivityRaw.find((r) => r.year === year);
      setTotalPlaytimeSeconds(yearEntry?.totalSeconds ?? null);
      const consoleMap = new Map(referenceData.data.consoles.map((c) => [c.uid, c.name]));
      const sortedRanking = rankingRaw
        .map((r) => ({
          gameUid: r.gameUid,
          totalHours: r.totalSeconds / 3600,
        }))
        .sort((a, b) => b.totalHours - a.totalHours);

      // Resolve display names for top games by gameUid only.
      // This avoids an extra /instances call per game; we rely on GameApi.get
      // (which is cached) for the display name.
      const topGameUids = [...new Set(sortedRanking.slice(0, 20).map((r) => r.gameUid))];
      const nameMap = new Map<string, string>();
      await Promise.all(
        topGameUids.map(async (uid) => {
          try {
            const game = await GameApi.get(uid);
            nameMap.set(uid, game.name);
          } catch {
            nameMap.set(uid, uid);
          }
        })
      );
      setGameRankingData(
        sortedRanking.map((r) => ({
          gameUid: r.gameUid,
          gameName: nameMap.get(r.gameUid) ?? r.gameUid,
          totalHours: r.totalHours,
        }))
      );
      setConsoleYearData(
        consoleRaw.map((r) => ({
          year: r.year,
          consoleUid: r.consoleUid,
          consoleName: consoleMap.get(r.consoleUid) ?? r.consoleUid,
          totalHours: r.totalSeconds / 3600,
          distinctGames: r.distinctGames,
          bookingCount: r.bookingCount,
        }))
      );
      const variantMap = new Map(referenceData.data.variants.map((v) => [v.uid, v.name]));
      setConsoleVariantData(
        consoleVariantRaw.map((r) => ({
          consoleName: consoleMap.get(r.consoleUid) ?? r.consoleUid,
          variantName: variantMap.get(r.variantUid) ?? r.variantUid,
          totalHours: r.totalSeconds / 3600,
          distinctGames: r.distinctGames ?? 0,
        }))
      );
      const pcUid = referenceData.data.consoles.find((c) => c.name === 'PC')?.uid ?? null;
      setPcInputStyleData(
        pcUid ? inputStyleRaw.filter((r) => r.consoleUid === pcUid) : []
      );
    } catch {
      setError('Failed to load yearly review data.');
      setYearlyReview(null);
      setTierlistResults([]);
      setTotalPlaytimeSeconds(null);
      setGameRankingData([]);
      setConsoleYearData([]);
      setConsoleVariantData([]);
      setPcInputStyleData([]);
    } finally {
      setLoading(false);
    }
  }, [year, referenceData]);

  useEffect(() => {
    if (!isLoaded) return;
    const key = `yearly-review-${year}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [isLoaded, load, year]);

  const tiers: SimpleLookupDto[] = (referenceData?.data?.tiers ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const cardsByTier = (tierUid: string) =>
    tierlistResults.filter((c) => cardTierUid(c) === tierUid);
  const tierListCardsOnly = tierlistResults.filter((c) => cardTierUid(c) != null);

  const categories = yearlyReview?.categories ?? [];
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <Box>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        <Typography variant="h4">Yearly review</Typography>
        <Button component={Link} to="/reviews/yearly/edit" variant="outlined" size="small">
          Edit yearly review
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      )}

      {!loading && (
        <Stack spacing={4}>
          {yearlyReview?.introText != null && yearlyReview.introText !== '' && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Intro</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {yearlyReview.introText}
              </Typography>
            </Box>
          )}

          {totalPlaytimeSeconds != null && (
            <Typography variant="h4" component="p" gutterBottom>
              Total playtime {formatTotalPlaytime(totalPlaytimeSeconds)}
            </Typography>
          )}

          <Box>
            <GamePlaytimeRankingBarChart data={gameRankingData} maxBars={15} />
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="flex-start">
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <ConsolePlaytimePieChart data={consoleYearData} year={year} />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <PcInputVariantsPieChart
                data={pcInputStyleData}
                year={year}
                inputName={inputName}
              />
            </Box>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="flex-start">
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <ConsoleVariantPlaytimeStackedBarChart
                data={consoleVariantData}
                year={year}
              />
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <ConsoleVariantGameCountStackedBarChart
                data={consoleVariantData}
                year={year}
              />
            </Box>
          </Stack>

          {tiers.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Tier list for playthroughs of {year}</Typography>
              <Stack spacing={0}>
                {tiers.map((tier, index) => {
                  const cards = cardsByTier(tier.uid);
                  if (cards.length === 0) return null;
                  const color = getTierColorByIndex(index);
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
                        sx={{
                          flex: 1,
                          display: 'flex',
                          gap: 2,
                          p: 2,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          overflowX: 'auto',
                        }}
                      >
                        {cards.map((card, idx) => (
                          <TierEntryCardView
                            key={`${card.displayName}-${card.playthroughs[0]?.playthroughUid ?? idx}`}
                            card={card}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
              {tierListCardsOnly.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tier list entries for {year}.
                </Typography>
              )}
            </Box>
          )}

          {sortedCategories.length > 0 && (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>Categories</Typography>
              <Stack spacing={4}>
                {sortedCategories.map((category) => {
                  const gamesSorted = [...category.games].sort((a, b) => a.order - b.order);
                  const rows = chunkGames(gamesSorted, 6);
                  return (
                    <Box key={category.uid}>
                      <Typography variant="h6" sx={{ mb: 1 }}>{category.name}</Typography>
                      <Stack spacing={2}>
                        {rows.map((row, rowIdx) => (
                          <Stack key={rowIdx} direction="row" spacing={2} flexWrap="wrap">
                            {row.map((game: YearlyReviewGameDto) => (
                              <YearlyReviewGameCard key={game.uid} game={game} />
                            ))}
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {yearlyReview?.outroText != null && yearlyReview.outroText !== '' && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Outro</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {yearlyReview.outroText}
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
