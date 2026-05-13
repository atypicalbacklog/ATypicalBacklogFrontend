import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { WeeklyPlaytimeDisplay } from '../hooks/useWeeklyPlaytime';
import { chartMargins, getYearColor } from '../chartColors';

interface Props {
  data: WeeklyPlaytimeDisplay[];
  height?: number;
}

export default function WeeklyPlaytimeLineChart({ data, height = 320 }: Props) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for the selected year range.</Typography>
        </CardContent>
      </Card>
    );
  }
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
  const maxWeek = Math.max(...data.map((d) => d.week));
  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);
  const series = years.map((year) => ({
    data: weeks.map((w) => {
      const v = data.find((d) => d.year === year && d.week === w)?.totalHours ?? 0;
      return Math.round(v * 10) / 10;
    }),
    label: String(year),
    showMark: false,
    color: getYearColor(year),
    curve: 'linear' as const,
  }));
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime per week (hours)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <LineChart
            xAxis={[
              {
                scaleType: 'point',
                data: weeks,
                valueFormatter: (v) => `W${String(v).padStart(2, '0')}`,
              },
            ]}
            series={series}
            height={height}
            margin={{ ...chartMargins.barVerticalWideBottom }}
            hideLegend
          />
        </Box>
      </CardContent>
    </Card>
  );
}
