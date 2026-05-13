import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ConsoleYearDisplay } from '../hooks/useConsoleYearActivity';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  formatPercentChartLabel,
  getConsoleColorByIndex,
  MIN_BAR_LABEL_PX,
} from '../chartColors';

interface Props {
  data: ConsoleYearDisplay[];
  height?: number;
}

/** Aggregate by year, then by console; compute share per year and show as 100% stacked bar per year. */
function toStackedPercent(data: ConsoleYearDisplay[]) {
  const byYear = new Map<number, { total: number; byConsole: Map<string, number> }>();
  for (const d of data) {
    let entry = byYear.get(d.year);
    if (!entry) {
      entry = { total: 0, byConsole: new Map() };
      byYear.set(d.year, entry);
    }
    entry.total += d.totalHours;
    entry.byConsole.set(d.consoleName, (entry.byConsole.get(d.consoleName) ?? 0) + d.totalHours);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);
  const consoles = [...new Set(data.map((d) => d.consoleName))].sort();
  const series = consoles.map((consoleName, i) => ({
    data: years.map((y) => {
      const entry = byYear.get(y)!;
      const total = entry.total || 1;
      const hours = entry.byConsole.get(consoleName) ?? 0;
      return Math.round((hours / total) * 1000) / 10;
    }),
    label: consoleName,
    stack: 'total' as const,
    color: getConsoleColorByIndex(i),
  }));
  return { yAxisData: years.map((y) => String(y)), series };
}

export default function ConsolePlaytimeStackedBarChart({ data, height = 320 }: Props) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for the selected year range.</Typography>
        </CardContent>
      </Card>
    );
  }
  const { yAxisData, series } = toStackedPercent(data);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime by console (% per year)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            layout="horizontal"
            yAxis={[{ scaleType: 'band', data: yAxisData }]}
            xAxis={[{ min: 0, max: 100, valueFormatter: (v: number) => formatPercentChartLabel(v) }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.width < MIN_BAR_LABEL_PX) return null;
              return formatPercentChartLabel(Number(item.value));
            }}
            height={height}
            margin={{ ...chartMargins.stackedHorizontal }}
            slotProps={{ ...contrastBarLabelSlotProps, legend: { position: { vertical: 'top', horizontal: 'center' } } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
