import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { isManagementMode } from '../../app/AppConfig';
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
import {
  TIER_LIST_CARD_GAP,
  TIER_LIST_ROW_GAP,
  TIER_LIST_ROW_PADDING,
} from '../../constants/tierListLayout';
import type { SimpleLookupDto } from '../../types/referenceData';
import GamePlaytimeRankingBarChart, {
  GAME_PLAYTIME_RANKING_MAX_BARS,
} from '../statistics/charts/GamePlaytimeRankingBarChart';
import ConsolePlaytimePieChart from '../statistics/charts/ConsolePlaytimePieChart';
import PcInputVariantsPieChart from '../statistics/charts/PcInputVariantsPieChart';
import ConsoleVariantPlaytimeStackedBarChart from '../statistics/charts/ConsoleVariantPlaytimeStackedBarChart';
import ConsoleVariantGameCountStackedBarChart from '../statistics/charts/ConsoleVariantGameCountStackedBarChart';
import type { ConsoleVariantPlaytimeRow } from '../statistics/charts/ConsoleVariantPlaytimeStackedBarChart';
import TierEntryCardView from '../reviews/TierEntryCardView';
import YearlyReviewGameCard from './YearlyReviewGameCard';
import YearlyReviewYearSelector from './YearlyReviewYearSelector';
import {
  getSelectableReviewYears,
  LAST_CALENDAR_YEAR,
} from './yearlyReviewYearUtils';
import { chunkYearlyReviewGames, isSideImagePresentation } from './yearlyReviewGamePresentationUtils';
import {
  yearlyReviewBlurredPanelSx,
  yearlyReviewSolidTextPanelSx,
} from './yearlyReviewPanelStyles';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { referenceData, isLoaded } = useReferenceData();
  const [searchParams, setSearchParams] = useSearchParams();
  const years = getSelectableReviewYears();

  const parseYearParam = useCallback((): number | null => {
    const raw = searchParams.get('year');
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return !Number.isNaN(parsed) && years.includes(parsed) ? parsed : null;
  }, [searchParams, years]);

  const [year, setYear] = useState(() => parseYearParam() ?? LAST_CALENDAR_YEAR);
  const [yearlyReview, setYearlyReview] = useState<YearlyReviewDto | null>(null);
  const [tierlistResults, setTierlistResults] = useState<ReviewSearchResultDto[]>([]);
  const [totalPlaytimeSeconds, setTotalPlaytimeSeconds] = useState<number | null>(null);
  const [gameRankingData, setGameRankingData] = useState<GamePlaytimeDisplay[]>([]);
  const [consoleYearData, setConsoleYearData] = useState<ConsoleYearDisplay[]>([]);
  const [consoleVariantData, setConsoleVariantData] = useState<ConsoleVariantPlaytimeRow[]>([]);
  const [pcInputStyleData, setPcInputStyleData] = useState<ConsoleInputStyleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = parseYearParam();
    if (fromUrl != null && fromUrl !== year) setYear(fromUrl);
  }, [parseYearParam, year]);

  useEffect(() => {
    if (!searchParams.get('year')) {
      setSearchParams({ year: String(year) }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setSearchParams({ year: String(newYear) }, { replace: true });
  };

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

      // Resolve display names for games shown in the ranking chart (same row cap as the chart).
      const topGameUids = [
        ...new Set(
          sortedRanking.slice(0, GAME_PLAYTIME_RANKING_MAX_BARS).map((r) => r.gameUid)
        ),
      ];
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
        {isManagementMode() ? (
          <Button component={Link} to="/reviews/yearly/edit" variant="outlined" size="small">
            Edit yearly review
          </Button>
        ) : null}
      </Stack>

      <YearlyReviewYearSelector
        years={years}
        selectedYear={year}
        onYearChange={handleYearChange}
      />

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
              <Box sx={yearlyReviewSolidTextPanelSx}>
                <Typography variant="body1" component="div">
                  {yearlyReview.introText}
                </Typography>
              </Box>
            </Box>
          )}

          {totalPlaytimeSeconds != null && (
            <Typography variant="h4" component="p" gutterBottom>
              Total playtime {formatTotalPlaytime(totalPlaytimeSeconds)}
            </Typography>
          )}

          <Box>
            <GamePlaytimeRankingBarChart data={gameRankingData} />
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="flex-start">
            <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 300px', minWidth: 0, width: isMobile ? '100%' : undefined }}>
              <ConsolePlaytimePieChart data={consoleYearData} year={year} compact={isMobile} />
            </Box>
            <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 300px', minWidth: 0, width: isMobile ? '100%' : undefined }}>
              <PcInputVariantsPieChart
                data={pcInputStyleData}
                year={year}
                inputName={inputName}
                compact={isMobile}
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
                        sx={{
                          flex: 1,
                          display: 'flex',
                          gap: TIER_LIST_CARD_GAP,
                          p: TIER_LIST_ROW_PADDING,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          overflowX: 'auto',
                        }}
                      >
                        {cards.map((card, idx) => (
                          <TierEntryCardView
                            key={`${card.displayName}-${card.playthroughs[0]?.playthroughUid ?? idx}`}
                            card={card}
                            compact={isMobile}
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
                  const rows = chunkYearlyReviewGames(gamesSorted, isMobile ? 2 : 6, isMobile);
                  return (
                    <Box key={category.uid} sx={yearlyReviewBlurredPanelSx}>
                      <Typography variant="h6" sx={{ mb: 1 }}>{category.name}</Typography>
                      <Stack spacing={isMobile ? 1 : 2}>
                        {rows.map((row, rowIdx) => (
                          <Stack
                            key={rowIdx}
                            direction="row"
                            spacing={isMobile ? 1 : 2}
                            flexWrap="wrap"
                            sx={{ width: '100%' }}
                          >
                            {row.map((game: YearlyReviewGameDto) => (
                              <Box
                                key={game.uid}
                                sx={
                                  isMobile && isSideImagePresentation(game.presentationType)
                                    ? { flex: '1 1 100%', maxWidth: '100%', minWidth: 0 }
                                    : undefined
                                }
                              >
                                <YearlyReviewGameCard game={game} compact={isMobile} />
                              </Box>
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
              <Box sx={yearlyReviewSolidTextPanelSx}>
                <Typography variant="body1" component="div">
                  {yearlyReview.outroText}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
