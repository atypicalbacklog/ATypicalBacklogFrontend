import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {
  getTimeBookingsByPlaythrough,
  reduceTimeBookingDuration,
} from '../../services/timeBookingApi';
import type { TimeBookingQueryDto } from '../../types/dto';
import { timeBookingDurationSeconds } from '../gameInstances/overview/timeBookingUtils';
import { formatSecondsAsHhMmSs } from './formatSecondsAsHhMmSs';
import { formatDateOnly, formatTimeOnly } from './formatTimestamp';

type RowFeedback = { kind: 'updated' } | { kind: 'error'; message: string };

interface Props {
  open: boolean;
  playthroughUid: string;
  displayName: string;
  onClose: () => void;
  onChanged?: () => void | Promise<void>;
}

function sortBookingsByStartDesc(bookings: TimeBookingQueryDto[]): TimeBookingQueryDto[] {
  return [...bookings].sort((a, b) => {
    const ta = a.startTime ? new Date(a.startTime).getTime() : 0;
    const tb = b.startTime ? new Date(b.startTime).getTime() : 0;
    return tb - ta;
  });
}

export default function PlaythroughTimeBookingsModal({
  open,
  playthroughUid,
  displayName,
  onClose,
  onChanged,
}: Props) {
  const [bookings, setBookings] = useState<TimeBookingQueryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowFeedback, setRowFeedback] = useState<Record<string, RowFeedback>>({});

  const [reduceOpen, setReduceOpen] = useState(false);
  const [reduceTarget, setReduceTarget] = useState<TimeBookingQueryDto | null>(null);
  const [reduceMinutes, setReduceMinutes] = useState('');
  const [reduceSubmitting, setReduceSubmitting] = useState(false);
  const [reduceError, setReduceError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getTimeBookingsByPlaythrough(playthroughUid);
      setBookings(sortBookingsByStartDesc(data));
    } catch {
      setLoadError('Failed to load time bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [playthroughUid]);

  useEffect(() => {
    if (!open) return;
    setRowFeedback({});
    void loadBookings();
  }, [open, loadBookings]);

  const reduceMaxMinutes = useMemo(() => {
    if (!reduceTarget?.endTime) return 0;
    return Math.floor(timeBookingDurationSeconds(reduceTarget) / 60);
  }, [reduceTarget]);

  const openReduce = (booking: TimeBookingQueryDto) => {
    setReduceTarget(booking);
    setReduceMinutes('');
    setReduceError(null);
    setReduceOpen(true);
  };

  const closeReduce = () => {
    if (reduceSubmitting) return;
    setReduceOpen(false);
    setReduceTarget(null);
    setReduceMinutes('');
    setReduceError(null);
  };

  const handleReduceSave = async () => {
    if (!reduceTarget) return;
    const durationMinutes = Number(reduceMinutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
      setReduceError('Enter a positive number of minutes.');
      return;
    }
    if (durationMinutes > reduceMaxMinutes) {
      setReduceError(`Cannot reduce by more than ${reduceMaxMinutes} minutes for this booking.`);
      return;
    }

    setReduceSubmitting(true);
    setReduceError(null);
    const targetUid = reduceTarget.uid;
    try {
      await reduceTimeBookingDuration({ uid: targetUid, durationMinutes });
      closeReduce();
      await loadBookings();
      setRowFeedback((prev) => ({ ...prev, [targetUid]: { kind: 'updated' } }));
      await onChanged?.();
    } catch {
      setRowFeedback((prev) => ({
        ...prev,
        [targetUid]: { kind: 'error', message: 'Failed to reduce booking duration.' },
      }));
      closeReduce();
    } finally {
      setReduceSubmitting(false);
    }
  };

  const renderRowStatus = (uid: string) => {
    const feedback = rowFeedback[uid];
    if (!feedback) return null;
    if (feedback.kind === 'updated') {
      return (
        <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
          updated
        </Typography>
      );
    }
    return (
      <Typography variant="caption" color="error.main">
        {feedback.message}
      </Typography>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ pr: 6 }}>
          Time bookings
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {displayName}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="Close"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          )}
          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : bookings.length === 0 && !loadError ? (
            <Typography variant="body2" color="text.secondary">
              No time bookings yet.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 520 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell align="right" sx={{ width: 48 }} />
                    <TableCell sx={{ minWidth: 88 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => {
                    const isOpen = booking.endTime == null;
                    const durationSec = timeBookingDurationSeconds(booking);
                    return (
                      <TableRow key={booking.uid} hover>
                        <TableCell>{formatDateOnly(booking.startTime)}</TableCell>
                        <TableCell>{formatTimeOnly(booking.startTime)}</TableCell>
                        <TableCell>{isOpen ? '—' : formatTimeOnly(booking.endTime)}</TableCell>
                        <TableCell>{formatSecondsAsHhMmSs(durationSec)}</TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title={isOpen ? 'Cannot reduce an open booking' : 'Reduce duration'}
                          >
                            <span>
                              <IconButton
                                size="small"
                                aria-label="Reduce booking duration"
                                disabled={isOpen}
                                onClick={() => openReduce(booking)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{renderRowStatus(booking.uid)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reduceOpen} onClose={closeReduce} maxWidth="xs" fullWidth>
        <DialogTitle>Reduce booking duration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {reduceTarget && (
              <Typography variant="body2" color="text.secondary">
                {formatDateOnly(reduceTarget.startTime)}{' '}
                {formatTimeOnly(reduceTarget.startTime)} –{' '}
                {formatTimeOnly(reduceTarget.endTime)} (
                {formatSecondsAsHhMmSs(timeBookingDurationSeconds(reduceTarget))})
              </Typography>
            )}
            <TextField
              type="number"
              label="Reduce by (minutes)"
              value={reduceMinutes}
              onChange={(e) => setReduceMinutes(e.target.value)}
              inputProps={{ min: 1, max: reduceMaxMinutes || undefined }}
              helperText={
                reduceMaxMinutes > 0
                  ? `Subtracts from end time. Max ${reduceMaxMinutes} min for this booking.`
                  : undefined
              }
              size="small"
              fullWidth
              autoFocus
            />
            {reduceError && (
              <Alert severity="error" onClose={() => setReduceError(null)}>
                {reduceError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReduce} disabled={reduceSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleReduceSave()}
            disabled={reduceSubmitting || !reduceMinutes}
          >
            {reduceSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
