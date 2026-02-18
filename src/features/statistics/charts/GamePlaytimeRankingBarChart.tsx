import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { GamePlaytimeDisplay } from '../hooks/useGamePlaytimeRanking';
import { formatPlaytimeHours, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';

interface Props {
  data: GamePlaytimeDisplay[];
  maxBars?: number;
  height?: number;
}

export default function GamePlaytimeRankingBarChart({
  data,
  maxBars = 15,
  height = 400,
}: Props) {
  if (data.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for the selected year range.</Typography>
        </CardContent>
      </Card>
    );
  }
  const slice = data.slice(0, maxBars);
  const yAxisData = slice.map((d) =>
    d.gameName.length > 24 ? d.gameName.slice(0, 21) + '…' : d.gameName
  );
  const seriesData = slice.map((d) => Math.round(d.totalHours * 10) / 10);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Top games by playtime (hours)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BarChart
            layout="horizontal"
            yAxis={[{ scaleType: 'band', data: yAxisData }]}
            series={[{ data: seriesData, label: 'Hours' }]}
            barLabel={(item, context) => {
              if (item.value == null || item.value <= 0) return null;
              if (context.bar.width < MIN_BAR_LABEL_PX) return null;
              return formatPlaytimeHours(item.value);
            }}
            height={height}
            margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
            slotProps={{ ...contrastBarLabelSlotProps, legend: { hidden: true } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
