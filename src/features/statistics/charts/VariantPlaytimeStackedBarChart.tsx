import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { VariantYearDisplay } from '../hooks/useVariantYearActivity';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  formatPercentChartLabel,
  getVariantColor,
  MIN_BAR_LABEL_PX,
} from '../chartColors';

interface Props {
  data: VariantYearDisplay[];
  height?: number;
}

/** Aggregate by year, then by variant; compute share per year and show as 100% stacked bar per year (vertical). */
function toStackedPercent(data: VariantYearDisplay[]) {
  const byYear = new Map<number, { total: number; byVariant: Map<string, number> }>();
  for (const d of data) {
    let entry = byYear.get(d.year);
    if (!entry) {
      entry = { total: 0, byVariant: new Map() };
      byYear.set(d.year, entry);
    }
    entry.total += d.totalHours;
    entry.byVariant.set(d.variantName, (entry.byVariant.get(d.variantName) ?? 0) + d.totalHours);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);
  const variants = [...new Set(data.map((d) => d.variantName))].sort();
  const series = variants.map((variantName) => ({
    data: years.map((y) => {
      const entry = byYear.get(y)!;
      const total = entry.total || 1;
      const hours = entry.byVariant.get(variantName) ?? 0;
      return Math.round((hours / total) * 1000) / 10;
    }),
    label: variantName,
    stack: 'total' as const,
    color: getVariantColor(variantName),
  }));
  return { xAxisData: years.map((y) => String(y)), series };
}

export default function VariantPlaytimeStackedBarChart({ data, height = 320 }: Props) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for the selected year range.</Typography>
        </CardContent>
      </Card>
    );
  }
  const { xAxisData, series } = toStackedPercent(data);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime by variant (% per year)
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
            slotProps={{ ...contrastBarLabelSlotProps, legend: { position: { vertical: 'top', horizontal: 'center' } } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
