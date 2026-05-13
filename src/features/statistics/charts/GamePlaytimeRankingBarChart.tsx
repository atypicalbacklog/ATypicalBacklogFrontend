import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { GamePlaytimeDisplay } from '../hooks/useGamePlaytimeRanking';
import { formatPlaytimeHours, MIN_BAR_LABEL_PX, contrastBarLabelSlotProps } from '../chartColors';

/** Max bars shown; exported so callers (e.g. yearly review) resolve names for the same slice. */
export const GAME_PLAYTIME_RANKING_MAX_BARS = 30;

/** Default cap on rows shown (was 15). */
const DEFAULT_MAX_BARS = GAME_PLAYTIME_RANKING_MAX_BARS;
/** Target pixels per bar row (horizontal layout); scales chart with bar count. */
const DEFAULT_HEIGHT_PER_BAR = 30;
/** BarChart top+bottom margin (see margin below). */
const CHART_VERTICAL_MARGIN = 40;
const DEFAULT_MIN_CHART_HEIGHT = 260;
const DEFAULT_MAX_CHART_HEIGHT = 960;

interface Props {
  data: GamePlaytimeDisplay[];
  maxBars?: number;
  /**
   * Fixed chart height (px). When omitted, height is derived from how many bars are shown
   * (clamped between minChartHeight and maxChartHeight).
   */
  height?: number;
  minChartHeight?: number;
  maxChartHeight?: number;
  heightPerBar?: number;
}

export default function GamePlaytimeRankingBarChart({
  data,
  maxBars = DEFAULT_MAX_BARS,
  height: heightProp,
  minChartHeight = DEFAULT_MIN_CHART_HEIGHT,
  maxChartHeight = DEFAULT_MAX_CHART_HEIGHT,
  heightPerBar = DEFAULT_HEIGHT_PER_BAR,
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
  const barCount = slice.length;
  const yAxisData = slice.map((d) => formatAxisLabel(d.gameName));
  const seriesData = slice.map((d) => Math.round(d.totalHours * 10) / 10);

  const chartHeight =
    heightProp ??
    Math.min(
      maxChartHeight,
      Math.max(minChartHeight, CHART_VERTICAL_MARGIN + barCount * heightPerBar)
    );

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
            height={chartHeight}
            margin={{ top: 20, right: 20, bottom: 20, left: -90 }}
            hideLegend
            slotProps={contrastBarLabelSlotProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
