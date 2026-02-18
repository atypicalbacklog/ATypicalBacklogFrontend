import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { WeekdayPlaytimeDisplay } from '../hooks/useWeekdayPlaytime';
import { getWeekdayColor, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';

interface Props {
  data: WeekdayPlaytimeDisplay[];
  height?: number;
}

/** Aggregate by year, then by weekday; compute share per year and show as 100% stacked bar per year. */
function toStackedPercent(data: WeekdayPlaytimeDisplay[]) {
  const byYear = new Map<number, { total: number; byWeekday: Map<number, number> }>();
  for (const d of data) {
    let entry = byYear.get(d.year);
    if (!entry) {
      entry = { total: 0, byWeekday: new Map() };
      byYear.set(d.year, entry);
    }
    entry.total += d.totalHours;
    entry.byWeekday.set(d.weekday, (entry.byWeekday.get(d.weekday) ?? 0) + d.totalHours);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);
  const weekdays = [0, 1, 2, 3, 4, 5, 6];
  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const series = weekdays.map((wd, i) => ({
    data: years.map((y) => {
      const entry = byYear.get(y)!;
      const total = entry.total || 1;
      const hours = entry.byWeekday.get(wd) ?? 0;
      return Math.round((hours / total) * 1000) / 10;
    }),
    label: weekdayNames[i],
    stack: 'total',
    color: getWeekdayColor(wd),
  }));
  return { xAxisData: years.map((y) => String(y)), series };
}

export default function WeekdayPlaytimeStackedBarChart({ data, height = 320 }: Props) {
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
          Playtime by weekday (% per year)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            layout="horizontal"
            yAxis={[{ scaleType: 'band', data: xAxisData }]}
            xAxis={[{ min: 0, max: 100, valueFormatter: (v) => `${v}%` }]}
            series={series}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.width < MIN_BAR_LABEL_PX) return null;
              return `${Number(item.value).toFixed(2)}%`;
            }}
            height={height}
            margin={{ top: 50, right: 20, bottom: 40, left: 60 }}
            slotProps={{ ...contrastBarLabelSlotProps, legend: { position: { vertical: 'top', horizontal: 'middle' } } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
