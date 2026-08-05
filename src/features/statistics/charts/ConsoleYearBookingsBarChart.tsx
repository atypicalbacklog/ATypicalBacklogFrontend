import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ConsoleYearDisplay } from '../hooks/useConsoleYearActivity';
import { chartMargins, getYearColor, barLabelIfFits, contrastBarLabelSlotProps, formatChartCountLabel } from '../chartColors';

interface Props {
  data: ConsoleYearDisplay[];
  height?: number;
}

export default function ConsoleYearBookingsBarChart({ data, height = 320 }: Props) {
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
  const consoles = [...new Set(data.map((d) => d.consoleName))].sort();

  const series = years.map((year) => ({
    data: consoles.map(
      (consoleName) =>
        data.find((d) => d.year === year && d.consoleName === consoleName)?.bookingCount ?? 0
    ),
    label: String(year),
    color: getYearColor(year),
  }));
  const xAxisData = consoles;
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Time bookings per console per year
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              return barLabelIfFits(formatChartCountLabel(item.value), context.bar);
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
