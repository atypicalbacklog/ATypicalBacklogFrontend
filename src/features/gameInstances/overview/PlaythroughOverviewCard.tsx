import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import type { TimeBookingQueryDto } from '../../../types/dto';
import { formatPlaytime } from '../../library/formatPlaytime';
import DateWithIcon from '../../shared/DateWithIcon';
import PlaythroughTypeWithIcon from '../../shared/PlaythroughTypeWithIcon';

const CARD_WIDTH_COLLAPSED = 220;
const CARD_WIDTH_WITH_CHART = 500;
const CHART_WIDTH = 460;
const CHART_HEIGHT = 200;
const CHART_CYAN = '#00ACC1';

/** Format minutes for datapoint tooltip: "00:00" when > 60, "00" when <= 60. */
function formatDurationTooltip(minutes: number): string {
  const m = Math.round(minutes);
  if (m <= 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${String(min).padStart(2, '0')}`;
}

/** Format minutes for y-axis label: "00:00" when > 60, "00" when <= 60. */
function formatDurationYAxis(minutes: number): string {
  const m = Math.round(minutes);
  if (m <= 60) return String(m);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${String(min).padStart(2, '0')}`;
}

interface Props {
  playthroughUid: string;
  typeName: string;
  stateName: string;
  startedAt: string;
  inputName: string;
  totalSeconds: number;
  dlcName: string | null;
  /** Time booking sessions (from api/playthroughs/{playthroughUid}/sessions / query/time-bookings). */
  sessions: TimeBookingQueryDto[];
  readOnly?: boolean;
}

export default function PlaythroughOverviewCard({
  playthroughUid,
  typeName,
  stateName,
  startedAt,
  inputName,
  totalSeconds,
  dlcName,
  sessions,
  readOnly = false,
}: Props) {
  const [chartOpen, setChartOpen] = useState(false);

  const scatterData = useMemo(() => {
    const withDuration = sessions
      .filter((s) => s.startTime != null && s.endTime != null)
      .map((s) => {
        const startMs = new Date(s.startTime!).getTime();
        const endMs = new Date(s.endTime!).getTime();
        const minutes = Math.round((endMs - startMs) / 60_000);
        return { session: s, minutes };
      })
      .filter((d) => Number.isFinite(d.minutes) && d.minutes >= 0);
    const sorted = [...withDuration].sort((a, b) => {
      const ta = a.session.creationDate ? new Date(a.session.creationDate).getTime() : 0;
      const tb = b.session.creationDate ? new Date(b.session.creationDate).getTime() : 0;
      return ta - tb;
    });
    return sorted.map((d, i) => ({
      id: d.session.uid,
      x: i,
      y: d.minutes,
    }));
  }, [sessions]);

  const hasSessions = scatterData.length > 0;

  const chartWidth = chartOpen && hasSessions ? CARD_WIDTH_WITH_CHART : CARD_WIDTH_COLLAPSED;

  return (
    <Card
      variant="outlined"
      sx={{
        width: chartWidth,
        minWidth: chartWidth,
        flexShrink: 0,
        transition: 'width 0.2s ease-in-out',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <PlaythroughTypeWithIcon typeName={typeName} size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {stateName}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Input: {inputName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 0.5 }}>
          <DateWithIcon date={startedAt} tooltip="Started" variant="body2" />
          <Typography variant="body2" component="span">
            {formatPlaytime(totalSeconds)}
          </Typography>
        </Box>
        {dlcName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            DLC: {dlcName}
          </Typography>
        )}
        {!readOnly ? (
          <Tooltip title="Edit Playthrough">
            <IconButton
              component={Link}
              to={`/playthroughs/${playthroughUid}`}
              size="small"
              aria-label="Edit Playthrough"
              sx={{ mt: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        <Typography
          component="button"
          variant="caption"
          onClick={() => setChartOpen((o) => !o)}
          sx={{
            mt: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {chartOpen ? '▲' : '▼'} Session duration
        </Typography>
        <Collapse in={chartOpen}>
          <Box
            sx={{
              mt: 1,
              width: CHART_WIDTH,
              minWidth: CHART_WIDTH,
              p: 1,
              borderRadius: 1,
              bgcolor: 'grey.800',
            }}
          >
            {hasSessions ? (
              <ScatterChart
                xAxis={[
                  {
                    scaleType: 'linear',
                    label: '',
                    tickLabelInterval: () => false,
                    disableTicks: true,
                  },
                ]}
                yAxis={[
                  {
                    label: 'Duration (min)',
                    min: 0,
                    valueFormatter: (v: number) => formatDurationYAxis(Number(v)),
                    tickNumber: 6,
                    width: 70,
                  },
                ]}
                series={[
                  {
                    data: scatterData,
                    label: 'Session',
                    type: 'scatter',
                    color: CHART_CYAN,
                    valueFormatter: (value) => (value ? formatDurationTooltip(value.y) : ''),
                  },
                ]}
                height={CHART_HEIGHT}
                margin={0}
                hideLegend
                slotProps={{ tooltip: { trigger: 'item' } }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                No time bookings yet
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
