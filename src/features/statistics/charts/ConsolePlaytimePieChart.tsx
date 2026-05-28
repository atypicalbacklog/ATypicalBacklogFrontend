import { PieChart, PieArcLabel } from '@mui/x-charts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ConsoleYearDisplay } from '../hooks/useConsoleYearActivity';
import {
  getConsoleColorByIndex,
  getContrastTextColor,
  formatPercentChartLabel,
  MIN_PIE_ARC_LABEL_ANGLE,
} from '../chartColors';

/** Pie arc label that uses black or white text depending on slice color. */
function ContrastPieArcLabel(props: React.ComponentProps<typeof PieArcLabel>) {
  const { color, style, ...rest } = props;
  const fill = getContrastTextColor(color ?? '#000000');
  return <PieArcLabel {...rest} color={color} style={{ ...style, fill }} />;
}

interface Props {
  data: ConsoleYearDisplay[];
  year: number;
  height?: number;
}

const ARC_LABEL_RADIUS = '78%';

export default function ConsolePlaytimePieChart({ data, year, height = 320 }: Props) {
  const forYear = data.filter((d) => d.year === year);
  if (forYear.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No data for {year}.</Typography>
        </CardContent>
      </Card>
    );
  }
  const total = forYear.reduce((s, d) => s + d.totalHours, 0);
  const sorted = [...forYear].sort((a, b) => a.consoleName.localeCompare(b.consoleName));
  const items = sorted
    .map((d, i) => ({
      id: d.consoleUid,
      value: total > 0 ? Math.round((d.totalHours / total) * 1000) / 10 : 0,
      label: d.consoleName,
      color: getConsoleColorByIndex(i),
    }))
    .filter((item) => item.value > 0);
  if (items.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No playtime in {year}.</Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Playtime by console ({year})
        </Typography>
        <Box sx={{ width: '100%' }}>
          <PieChart
            series={[
              {
                data: items,
                arcLabel: (item) =>
                  item.value > 0 ? formatPercentChartLabel(Number(item.value)) : '',
                arcLabelMinAngle: MIN_PIE_ARC_LABEL_ANGLE,
                arcLabelRadius: ARC_LABEL_RADIUS,
              },
            ]}
            height={height}
            margin={{ top: 10, right: 120, bottom: 10, left: 10 }}
            slots={{ pieArcLabel: ContrastPieArcLabel }}
            slotProps={{
              legend: {
                position: { vertical: 'middle' },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
