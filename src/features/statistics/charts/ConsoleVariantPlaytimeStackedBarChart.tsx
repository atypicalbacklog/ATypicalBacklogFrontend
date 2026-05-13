import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  formatPercentChartLabel,
  getVariantColor,
  MIN_BAR_LABEL_PX,
} from '../chartColors';

export interface ConsoleVariantPlaytimeRow {
  consoleName: string;
  variantName: string;
  totalHours: number;
  /** Game count (distinct games) for this console/variant; used by game count chart. */
  distinctGames?: number;
}

interface Props {
  data: ConsoleVariantPlaytimeRow[];
  year: number;
  height?: number;
}

/**
 * Aggregate by console, then by variant; compute share per console and show as 100% stacked vertical bar per console.
 * X axis = consoles, Y axis = percent.
 */
function toStackedPercentByConsole(data: ConsoleVariantPlaytimeRow[]) {
  const byConsole = new Map<string, { total: number; byVariant: Map<string, number> }>();
  for (const d of data) {
    let entry = byConsole.get(d.consoleName);
    if (!entry) {
      entry = { total: 0, byVariant: new Map() };
      byConsole.set(d.consoleName, entry);
    }
    entry.total += d.totalHours;
    entry.byVariant.set(
      d.variantName,
      (entry.byVariant.get(d.variantName) ?? 0) + d.totalHours
    );
  }
  const consoles = [...byConsole.keys()].sort();
  const variants = [...new Set(data.map((d) => d.variantName))].sort();
  const series = variants.map((variantName) => ({
    data: consoles.map((c) => {
      const entry = byConsole.get(c)!;
      const total = entry.total || 1;
      const hours = entry.byVariant.get(variantName) ?? 0;
      return Math.round((hours / total) * 1000) / 10;
    }),
    label: variantName,
    stack: 'total' as const,
    color: getVariantColor(variantName),
  }));
  return { xAxisData: consoles, series };
}

export default function ConsoleVariantPlaytimeStackedBarChart({
  data,
  year,
  height = 320,
}: Props) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            No data for {year}.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  const { xAxisData, series } = toStackedPercentByConsole(data);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime by variant (% per console) — {year}
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData }]}
            yAxis={[{ min: 0, max: 100, valueFormatter: (v: number) => formatPercentChartLabel(v) }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.height < MIN_BAR_LABEL_PX) return null;
              return formatPercentChartLabel(Number(item.value));
            }}
            height={height}
            margin={{ ...chartMargins.stackedVertical }}
            slotProps={{
              ...contrastBarLabelSlotProps,
              legend: { position: { vertical: 'top', horizontal: 'center' } },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
