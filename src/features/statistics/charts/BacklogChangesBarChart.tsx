import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { BacklogChangesByYearRow } from '../backlogChangesUtils';
import { BACKLOG_CHANGES_GROUP_LABELS } from '../backlogChangesUtils';
import {
  chartMargins,
  contrastBarLabelSlotProps,
  getYearColor,
  MIN_BAR_LABEL_PX,
} from '../chartColors';

interface Props {
  data: BacklogChangesByYearRow[];
  height?: number;
}

export default function BacklogChangesBarChart({ data, height = 320 }: Props) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for the selected year range.</Typography>
        </CardContent>
      </Card>
    );
  }

  const xAxisData = [...BACKLOG_CHANGES_GROUP_LABELS];
  const series = data.map((row) => ({
    data: [
      row.addedToBacklog,
      row.addedFree,
      row.removedFromBacklog,
      row.finishedDate,
      row.completedDate,
    ],
    label: String(row.year),
    color: getYearColor(row.year),
  }));

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Backlog changes
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: xAxisData }]}
            series={series}
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
