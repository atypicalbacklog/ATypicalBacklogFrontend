import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { getVariantColor, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';
import type { ConsoleVariantPlaytimeRow } from './ConsoleVariantPlaytimeStackedBarChart';

interface Props {
  data: ConsoleVariantPlaytimeRow[];
  year: number;
  height?: number;
}

/**
 * Aggregate by console, then by variant; show stacked game count (distinctGames) per console.
 * X axis = consoles, Y axis = count.
 */
function toStackedCountByConsole(data: ConsoleVariantPlaytimeRow[]) {
  const byConsole = new Map<string, { byVariant: Map<string, number> }>();
  for (const d of data) {
    const count = d.distinctGames ?? 0;
    if (count <= 0) continue;
    let entry = byConsole.get(d.consoleName);
    if (!entry) {
      entry = { byVariant: new Map() };
      byConsole.set(d.consoleName, entry);
    }
    entry.byVariant.set(
      d.variantName,
      (entry.byVariant.get(d.variantName) ?? 0) + count
    );
  }
  const consoles = [...byConsole.keys()].sort();
  const variants = [...new Set(data.map((d) => d.variantName))].sort();
  const series = variants.map((variantName) => ({
    data: consoles.map((c) => {
      const entry = byConsole.get(c)!;
      return entry.byVariant.get(variantName) ?? 0;
    }),
    label: variantName,
    stack: 'total' as const,
    color: getVariantColor(variantName),
  }));
  return { xAxisData: consoles, series };
}

export default function ConsoleVariantGameCountStackedBarChart({
  data,
  year,
  height = 320,
}: Props) {
  const hasCounts = data.some((d) => (d.distinctGames ?? 0) > 0);
  if (data.length === 0 || !hasCounts) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            No game count data for {year}.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  const { xAxisData, series } = toStackedCountByConsole(data);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Game count by variant (per console) — {year}
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData }]}
            yAxis={[{ min: 0, valueFormatter: (v: number) => String(Math.round(v)) }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.height < MIN_BAR_LABEL_PX) return null;
              return String(item.value);
            }}
            height={height}
            margin={{ top: 50, right: 20, bottom: 40, left: 50 }}
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
