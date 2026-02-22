import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { YearlyActivityDisplay } from '../hooks/useYearlyActivityStats';
import { yearOrdinalColorMap, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';

interface Props {
  data: YearlyActivityDisplay[];
  height?: number;
}

export default function YearlyCompletionsBarChart({ data, height = 320 }: Props) {
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
  const seriesData = data.map((d) => d.completionCount);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Backlog completions per year
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData, colorMap: yearOrdinalColorMap(xAxisData) }]}
            series={[{ data: seriesData, label: 'Completions' }]}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.height < MIN_BAR_LABEL_PX) return null;
              return String(item.value);
            }}
            height={height}
            margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            hideLegend
            slotProps={contrastBarLabelSlotProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
