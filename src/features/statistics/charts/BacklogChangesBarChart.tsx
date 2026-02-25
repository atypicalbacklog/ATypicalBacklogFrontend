import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { BacklogChangesByYearRow } from '../backlogChangesUtils';
import { BACKLOG_CHANGES_GROUP_LABELS } from '../backlogChangesUtils';
import { getYearColor, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';

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
            margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            hideLegend
            slotProps={contrastBarLabelSlotProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
