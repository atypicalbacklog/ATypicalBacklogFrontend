import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { MonthlyPlaytimeDisplay } from '../hooks/useMonthlyPlaytime';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  formatChartHoursOnly,
  getYearColor,
  MIN_BAR_LABEL_PX,
} from '../chartColors';

interface Props {
  data: MonthlyPlaytimeDisplay[];
  height?: number;
}

export default function MonthlyPlaytimeBarChart({ data, height = 320 }: Props) {
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
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const series = years.map((year) => ({
    data: months.map((m) => {
      const v = data.find((d) => d.year === year && d.month === m)?.totalHours ?? 0;
      return Math.round(v * 10) / 10;
    }),
    label: String(year),
    color: getYearColor(year),
    stack: 'total',
  }));

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime per month (hours, stacked by year)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            layout="horizontal"
            yAxis={[{ scaleType: 'band', data: monthNames }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.width < MIN_BAR_LABEL_PX) return null;
              return formatChartHoursOnly(item.value);
            }}
            height={height}
            margin={{ ...chartMargins.barHorizontal }}
            hideLegend
            slotProps={contrastBarLabelSlotProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
