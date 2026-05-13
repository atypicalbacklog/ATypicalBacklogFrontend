import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { YearlyActivityDisplay } from '../hooks/useYearlyActivityStats';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  formatChartHoursOnly,
  MIN_BAR_LABEL_PX,
  yearOrdinalColorMap,
} from '../chartColors';

interface YearlyPlaytimeBarChartProps {
  data: YearlyActivityDisplay[];
  height?: number;
}

export default function YearlyPlaytimeBarChart({ data, height = 320 }: YearlyPlaytimeBarChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for the selected year range.</Typography>
        </CardContent>
      </Card>
    );
  }

  const xAxisData = data.map((d) => String(d.year));
  const seriesData = data.map((d) => Math.round(d.totalHours * 10) / 10);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Total playtime per year (hours)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData, colorMap: yearOrdinalColorMap(xAxisData) }]}
            series={[{ data: seriesData, label: 'Hours' }]}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.height < MIN_BAR_LABEL_PX) return null;
              return formatChartHoursOnly(item.value);
            }}
            height={height}
            margin={{ ...chartMargins.barVertical }}
            hideLegend
            slotProps={contrastBarLabelSlotProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
