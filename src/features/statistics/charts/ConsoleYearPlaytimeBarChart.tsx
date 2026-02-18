import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ConsoleYearDisplay } from '../hooks/useConsoleYearActivity';
import { getYearColor, formatPlaytimeHours, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';

interface Props {
  data: ConsoleYearDisplay[];
  height?: number;
}

export default function ConsoleYearPlaytimeBarChart({ data, height = 320 }: Props) {
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

  // Group by console, with one series per year (colored by the year palette).
  const series = years.map((year) => ({
    data: consoles.map(
      (consoleName) =>
        data.find((d) => d.year === year && d.consoleName === consoleName)?.totalHours ?? 0
    ),
    label: String(year),
    color: getYearColor(year),
  }));
  const xAxisData = consoles;
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime per console per year (hours)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.height < MIN_BAR_LABEL_PX) return null;
              return formatPlaytimeHours(item.value);
            }}
            height={height}
            margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            slotProps={{ ...contrastBarLabelSlotProps, legend: { hidden: true } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
