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
  const maxLabelChars = 28;
  const maxLabelCharsFirstLine = 22;

  function formatAxisLabel(name: string): string {
    if (name.length <= maxLabelChars) return name;
    const firstLineEnd = name.lastIndexOf(' ', maxLabelCharsFirstLine + 1);
    const breakAt =
      firstLineEnd > 0 ? firstLineEnd : Math.min(maxLabelCharsFirstLine, name.length);
    return `${name.slice(0, breakAt).trim()}\n${name.slice(breakAt).trim()}`;
  }

  const slice = data.slice(0, maxBars);
  const yAxisData = slice.map((d) => formatAxisLabel(d.gameName));
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
            xAxis={[
              {
                label: '',
                tickLabelInterval: () => false,
                disableTicks: true,
              }
            ]}
            yAxis={[
              {
                scaleType: 'band',
                data: yAxisData,
                width: 250,
                tickLabelStyle: { whiteSpace: 'pre-line', lineHeight: 1.2 },
              },
            ]}
            series={[
              {
                data: seriesData,
                label: 'Hours',
                barLabel: (item, context) => {
                  if (item.value == null || item.value <= 0) return null;
                  if (context.bar.width < MIN_BAR_LABEL_PX) return null;
                  return formatPlaytimeHours(item.value);
                },
              },
            ]}
            height={height}
            margin={{ top: 20, right: 20, bottom: 20, left: -100 }}
            hideLegend
            slotProps={contrastBarLabelSlotProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
