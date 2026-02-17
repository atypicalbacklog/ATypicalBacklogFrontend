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
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PlaythroughTypeWithIcon from '../shared/PlaythroughTypeWithIcon';
import SmartImage from '../shared/SmartImage';
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

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
        maxWidth: 250,
      }}
    >
      {/* Playthrough type (centered, bordered, bigger & bold) */}
      <Tooltip title={row.displayName}>
        <Box
          sx={{
            p: 0,
            textAlign: 'center',
            ...headerBorder,
            mx: 1,
            mt: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlaythroughTypeWithIcon typeName={playthroughTypeName} size="header" />
        </Box>
      </Tooltip>

      {/* Middle: Thumbnail + overlay (shorter vertical aspect) */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4/3',
          flexShrink: 0,
        }}
      >
        <SmartImage
          imageUid={row.coverImageUid}
          thumbnail={false}
          alt=""
          aspectRatio={4 / 5}
          fit="contain"
          sx={{ width: '100%', height: '100%' }}
          showPlaceholder
        />
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
        height={35}
        sx={{ p: 1 }}
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
