import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { YearlyActivityDisplay } from '../hooks/useYearlyActivityStats';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  MIN_BAR_LABEL_PX,
  yearOrdinalColorMap,
} from '../chartColors';

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
          Backlog Games finished per year
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData, colorMap: yearOrdinalColorMap(xAxisData) }]}
            series={[{ data: seriesData, label: 'Finished' }]}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.height < MIN_BAR_LABEL_PX) return null;
              return String(item.value);
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
