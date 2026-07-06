import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { fetchYearlyActivity } from '../../services/statisticsApi';
import YearlyDistinctGamesBarChart from '../statistics/charts/YearlyDistinctGamesBarChart';
import type { YearlyActivityDisplay } from '../statistics/hooks/useYearlyActivityStats';
import {
  CURRENT_CALENDAR_YEAR,
  getLandingReviewYearLinks,
  isSelectableReviewYear,
  YEARLY_REVIEW_MIN_YEAR,
} from '../yearlyReview/yearlyReviewYearUtils';
import { yearlyReviewBlurredPanelSx } from '../yearlyReview/yearlyReviewPanelStyles';
import { landingCtaButtonSx, landingFooterNavButtonSx } from './landingCtaButtonStyles';

function toDistinctGamesDisplay(
  rows: Awaited<ReturnType<typeof fetchYearlyActivity>>
): YearlyActivityDisplay[] {
  return rows
    .filter((r) => r.year >= YEARLY_REVIEW_MIN_YEAR && r.year <= CURRENT_CALENDAR_YEAR)
    .sort((a, b) => a.year - b.year)
    .map((r) => ({
      year: r.year,
      totalHours: r.totalSeconds / 3600,
      activeDays: r.activeDays,
      bookingCount: r.bookingCount,
      distinctGames: r.distinctGames,
      completionCount: r.completionCount,
    }));
}

export default function LandingPageFooter() {
  const [yearlyChartData, setYearlyChartData] = useState<YearlyActivityDisplay[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setChartLoading(true);
    fetchYearlyActivity()
      .then((raw) => {
        if (cancelled) return;
        setYearlyChartData(toDistinctGamesDisplay(raw));
      })
      .catch(() => {
        if (cancelled) return;
        setYearlyChartData([]);
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reviewYears = getLandingReviewYearLinks();

  return (
    <Box sx={{ mt: 1.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to="/library"
          disableElevation
          fullWidth
          sx={landingFooterNavButtonSx}
        >
          Check out Library
        </Button>
        <Button
          component={RouterLink}
          to="/backlog"
          disableElevation
          fullWidth
          sx={landingFooterNavButtonSx}
        >
          Check out Backlog
        </Button>
      </Stack>

      <Box sx={{ ...yearlyReviewBlurredPanelSx, mb: 2 }}>
        {chartLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <YearlyDistinctGamesBarChart data={yearlyChartData} />
        )}
      </Box>

      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 6, pb: 2 }}
      >
        {reviewYears.map((y) => (
          <Button
            key={y}
            component={RouterLink}
            to={`/reviews/yearly?year=${y}`}
            disableElevation
            disabled={!isSelectableReviewYear(y)}
            sx={[
              landingCtaButtonSx,
              {
                flex: { xs: '1 1 100%', sm: '1 1 0' },
                minWidth: { sm: 0 },
              },
            ]}
          >
            Review of {y}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
