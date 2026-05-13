import { PieChart, PieArcLabel } from '@mui/x-charts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ConsoleInputStyleDto } from '../../../services/statisticsApi';
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

export interface PcInputVariantsPieChartProps {
  /** Console-inputstyle rows for the selected year; should already be filtered to PC console. */
  data: ConsoleInputStyleDto[];
  year: number;
  /** Resolve input_uid to display name (e.g. from reference data inputs). */
  inputName: (inputUid: string) => string;
  height?: number;
}

/**
 * Pie chart of PC playtime by input variant (e.g. Controller, Keyboard/Mouse).
 * Use data from fetchConsoleInputStylePlaytime(year) filtered by PC consoleUid.
 */
export default function PcInputVariantsPieChart({
  data,
  year,
  inputName,
  height = 320,
}: PcInputVariantsPieChartProps) {
  const forYear = data.filter((d) => d.year === year);
  if (forYear.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No PC input data for {year}.</Typography>
        </CardContent>
      </Card>
    );
  }

  const byInput = new Map<string, number>();
  for (const d of forYear) {
    const prev = byInput.get(d.inputUid) ?? 0;
    byInput.set(d.inputUid, prev + d.totalSeconds);
  }

  const sortedEntries = [...byInput.entries()].sort((a, b) => b[1] - a[1]);
  const total = sortedEntries.reduce((s, [, sec]) => s + sec, 0);
  const items = sortedEntries
    .map(([inputUid, sec], i) => ({
      id: inputUid,
      value: total > 0 ? Math.round((sec / total) * 1000) / 10 : 0,
      label: inputName(inputUid),
      color: getConsoleColorByIndex(i),
    }))
    .filter((item) => item.value > 0);

  if (items.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">No PC playtime in {year}.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          PC input variants ({year})
        </Typography>
        <Box sx={{ width: '100%' }}>
          <PieChart
            series={[
              {
                data: items,
                arcLabel: (item) =>
                  item.value > 0 ? formatPercentChartLabel(Number(item.value)) : '',
                arcLabelMinAngle: MIN_PIE_ARC_LABEL_ANGLE,
              },
            ]}
            height={height}
            margin={{ top: 10, right: 120, bottom: 10, left: 10 }}
            slots={{ pieArcLabel: ContrastPieArcLabel }}
            slotProps={{
              legend: {
                position: { vertical: 'middle'},
              } as React.ComponentProps<typeof PieChart>['slotProps'] extends { legend?: infer L } ? L : never,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
