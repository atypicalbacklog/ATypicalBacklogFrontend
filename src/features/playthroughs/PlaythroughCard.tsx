import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getImageUrl } from '../../services/imageApi';
import TimeTrackingOverlay from './TimeTrackingOverlay';
import PlaythroughTimeDisplay from './PlaythroughTimeDisplay';
import type { ActivePlaythroughOverviewRow } from '../../types/dto';

interface Props {
  row: ActivePlaythroughOverviewRow;
  playthroughTypeName: string;
  onStart: (playthroughUid: string) => void;
  onStop: (playthroughUid: string) => void;
  onAddRetroactive: (
    playthroughUid: string,
    payload: { date: string; minuteCount: number }
  ) => void | Promise<void>;
  isActionDisabled: boolean;
}

const headerBorder = { border: 1, borderColor: 'divider', borderRadius: 1 };

const today = () => new Date().toISOString().slice(0, 10);

export default function PlaythroughCard({
  row,
  playthroughTypeName,
  onStart,
  onStop,
  onAddRetroactive,
  isActionDisabled,
}: Props) {
  const [retroactiveOpen, setRetroactiveOpen] = useState(false);
  const [retroactiveDate, setRetroactiveDate] = useState(today);
  const [retroactiveHours, setRetroactiveHours] = useState(0);
  const [retroactiveMinutes, setRetroactiveMinutes] = useState(0);
  const [retroactiveSubmitting, setRetroactiveSubmitting] = useState(false);

  const handleOverlayClick = () => {
    if (isActionDisabled) return;
    if (row.isTimeTrackingActive) {
      onStop(row.playthroughUid);
    } else {
      onStart(row.playthroughUid);
    }
  };

  const thumbnailUrl = getImageUrl(row.coverImageUid, false);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(4px)',
        maxWidth: 280,
      }}
    >
      {/* Top: Game name (centered, bordered) */}
      <Box sx={{ p: 1.5, textAlign: 'center', ...headerBorder, mx: 1, mt: 1 }}>
        <Typography variant="h6" fontWeight={600} noWrap title={row.displayName}>
          {row.displayName}
        </Typography>
      </Box>
      {/* Playthrough type (centered, bordered) */}
      <Box sx={{ p: 1, textAlign: 'center', ...headerBorder, mx: 1, mt: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {playthroughTypeName}
        </Typography>
      </Box>

      {/* Middle: Thumbnail + overlay (vertical aspect) */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '3/4',
          bgcolor: 'grey.300',
          flexShrink: 0,
        }}
      >
        {thumbnailUrl ? (
          <Box
            component="img"
            src={thumbnailUrl}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        <TimeTrackingOverlay
          isTimeTrackingActive={row.isTimeTrackingActive}
          onClick={handleOverlayClick}
          disabled={isActionDisabled}
        />
      </Box>

      {/* Bottom: Gear, Clock → Edit / Add overlooked, Time (hh:mm:ss) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 1.5, pt: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Link
            component={RouterLink}
            to={`/playthroughs/${row.playthroughUid}`}
            sx={{
              color: 'text.secondary',
              fontSize: 24,
              lineHeight: 1,
              '&:hover': { color: 'primary.main' },
            }}
            aria-label="Edit playthrough"
          >
            ⚙
          </Link>
          <IconButton
            size="small"
            onClick={() => setRetroactiveOpen(true)}
            disabled={isActionDisabled}
            aria-label="Add overlooked booking"
            sx={{ color: 'text.secondary', fontSize: 22 }}
          >
            🕐
          </IconButton>
        </Stack>
        <PlaythroughTimeDisplay
          totalPlaytimeSeconds={row.totalPlaytimeSeconds}
          isTimeTrackingActive={row.isTimeTrackingActive}
          activeSessionStartedAt={row.activeSessionStartedAt}
        />
      </Stack>

      <Dialog open={retroactiveOpen} onClose={() => setRetroactiveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add overlooked booking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              type="date"
              label="Date"
              value={retroactiveDate}
              onChange={(e) => setRetroactiveDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                type="number"
                label="Hours"
                value={retroactiveHours}
                onChange={(e) =>
                  setRetroactiveHours(Math.max(0, Math.min(10, Number(e.target.value) || 0)))
                }
                inputProps={{ min: 0, max: 10 }}
                size="small"
                sx={{ width: 100 }}
              />
              <TextField
                type="number"
                label="Minutes"
                value={retroactiveMinutes}
                onChange={(e) =>
                  setRetroactiveMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))
                }
                inputProps={{ min: 0, max: 59 }}
                size="small"
                sx={{ width: 100 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Total max 10 hours (600 min). Booking starts at noon on the selected date.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetroactiveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const minuteCount = retroactiveHours * 60 + retroactiveMinutes;
              if (minuteCount < 1 || minuteCount > 600) return;
              setRetroactiveSubmitting(true);
              try {
                await onAddRetroactive(row.playthroughUid, {
                  date: retroactiveDate,
                  minuteCount,
                });
                setRetroactiveOpen(false);
                setRetroactiveDate(today());
                setRetroactiveHours(0);
                setRetroactiveMinutes(0);
              } finally {
                setRetroactiveSubmitting(false);
              }
            }}
            disabled={
              retroactiveSubmitting ||
              retroactiveHours * 60 + retroactiveMinutes < 1 ||
              retroactiveHours * 60 + retroactiveMinutes > 600
            }
          >
            {retroactiveSubmitting ? 'Adding…' : 'Add overlooked booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
