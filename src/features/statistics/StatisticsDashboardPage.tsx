import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StatisticsFiltersProvider, useStatisticsFilters } from './StatisticsFiltersContext';
import StatisticsFilterBar from './StatisticsFilterBar';
import { useYearlyActivityStats } from './hooks/useYearlyActivityStats';
import { useConsoleYearActivity } from './hooks/useConsoleYearActivity';
import { useVariantYearActivity } from './hooks/useVariantYearActivity';
import { useMonthlyPlaytime } from './hooks/useMonthlyPlaytime';
import { useWeeklyPlaytime } from './hooks/useWeeklyPlaytime';
import { useWeekdayPlaytime } from './hooks/useWeekdayPlaytime';
import { useBacklogCompletionGameOverview } from './hooks/useBacklogCompletionGameOverview';
import YearlyPlaytimeBarChart from './charts/YearlyPlaytimeBarChart';
import YearlyBookingDaysBarChart from './charts/YearlyBookingDaysBarChart';
import YearlyBookingCountBarChart from './charts/YearlyBookingCountBarChart';
import YearlyDistinctGamesBarChart from './charts/YearlyDistinctGamesBarChart';
import YearlyCompletionsBarChart from './charts/YearlyCompletionsBarChart';
import ConsoleYearPlaytimeBarChart from './charts/ConsoleYearPlaytimeBarChart';
import ConsoleYearGamesBarChart from './charts/ConsoleYearGamesBarChart';
import ConsoleYearBookingsBarChart from './charts/ConsoleYearBookingsBarChart';
import ConsolePlaytimeStackedBarChart from './charts/ConsolePlaytimeStackedBarChart';
import VariantPlaytimeStackedBarChart from './charts/VariantPlaytimeStackedBarChart';
import MonthlyPlaytimeBarChart from './charts/MonthlyPlaytimeBarChart';
import WeeklyPlaytimeLineChart from './charts/WeeklyPlaytimeLineChart';
import WeekdayPlaytimeStackedBarChart from './charts/WeekdayPlaytimeStackedBarChart';
import BacklogChangesBarChart from './charts/BacklogChangesBarChart';
import { groupBacklogChangesByYear } from './backlogChangesUtils';

function ChartCard({
  loading,
  error,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  if (error) {
    return (
      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 320,
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }
  return <>{children}</>;
}

function StatisticsDashboardContent() {
  const { fromYear, toYear, yearRange } = useStatisticsFilters();
  const { data: yearlyData, isLoading: yearlyLoading, error: yearlyError } = useYearlyActivityStats();
  const {
    data: backlogOverviewData,
    isLoading: backlogOverviewLoading,
    error: backlogOverviewError,
  } = useBacklogCompletionGameOverview();
  const {
    data: consoleYearData,
    isLoading: consoleYearLoading,
    error: consoleYearError,
  } = useConsoleYearActivity();
  const {
    data: variantYearData,
    isLoading: variantYearLoading,
    error: variantYearError,
  } = useVariantYearActivity();
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useMonthlyPlaytime();
  const { data: weeklyData, isLoading: weeklyLoading, error: weeklyError } = useWeeklyPlaytime();
  const { data: weekdayData, isLoading: weekdayLoading, error: weekdayError } =
    useWeekdayPlaytime();
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Statistics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        Playtime and activity for {fromYear}–{toYear}. Adjust the year range to change all charts.
      </Typography>

      <StatisticsFilterBar />

      {yearlyError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {yearlyError}
        </Alert>
      )}

      {yearlyLoading && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      )}

      {!yearlyLoading && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Yearly activity */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" color="text.secondary">
                  Yearly activity
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <YearlyPlaytimeBarChart data={yearlyData} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <YearlyBookingDaysBarChart data={yearlyData} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <YearlyBookingCountBarChart data={yearlyData} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <YearlyDistinctGamesBarChart data={yearlyData} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <YearlyCompletionsBarChart data={yearlyData} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Console */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" color="text.secondary">
                  By console
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={6}>
                    <ChartCard loading={consoleYearLoading} error={consoleYearError}>
                      <ConsoleYearPlaytimeBarChart data={consoleYearData} />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <ChartCard loading={consoleYearLoading} error={consoleYearError}>
                      <ConsoleYearGamesBarChart data={consoleYearData} />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <ChartCard loading={consoleYearLoading} error={consoleYearError}>
                      <ConsoleYearBookingsBarChart data={consoleYearData} />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12}>
                    <ChartCard loading={consoleYearLoading} error={consoleYearError}>
                      <ConsolePlaytimeStackedBarChart data={consoleYearData} />
                    </ChartCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Variant */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" color="text.secondary">
                  By variant
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ChartCard loading={variantYearLoading} error={variantYearError}>
                      <VariantPlaytimeStackedBarChart data={variantYearData} />
                    </ChartCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Backlog changes */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" color="text.secondary">
                  Backlog changes
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ChartCard
                      loading={backlogOverviewLoading}
                      error={backlogOverviewError}
                    >
                      <BacklogChangesBarChart
                        data={groupBacklogChangesByYear(backlogOverviewData, yearRange)}
                      />
                    </ChartCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Calendar: monthly & weekly */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" color="text.secondary">
                  By month & week
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ChartCard loading={monthlyLoading} error={monthlyError}>
                      <MonthlyPlaytimeBarChart data={monthlyData} />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ChartCard loading={weeklyLoading} error={weeklyError}>
                      <WeeklyPlaytimeLineChart data={weeklyData} />
                    </ChartCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Weekday */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" color="text.secondary">
                  By weekday
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ChartCard loading={weekdayLoading} error={weekdayError}>
                      <WeekdayPlaytimeStackedBarChart data={weekdayData} />
                    </ChartCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default function StatisticsDashboardPage() {
  return (
    <StatisticsFiltersProvider>
      <StatisticsDashboardContent />
    </StatisticsFiltersProvider>
  );
}
