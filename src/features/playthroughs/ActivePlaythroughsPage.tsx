import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { fetchActivePlaythroughs } from '../../services/activePlaythroughsApi';
import { PlaySessionApi } from '../../services/playSessionApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { formatPlaytime } from '../library/formatPlaytime';
import { formatTimestamp } from './formatTimestamp';
import type { ActivePlaythroughOverviewRow } from '../../types/dto';

const THUMBNAIL_BASE = '/api/thumbnails';

export default function ActivePlaythroughsPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const [rows, setRows] = useState<ActivePlaythroughOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUid, setActionUid] = useState<string | null>(null);

  useEffect(() => {
    fetchActivePlaythroughs()
      .then(setRows)
      .catch(() => setError('Failed to load active playthroughs.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (playthroughUid: string) => {
    setActionUid(playthroughUid);
    try {
      await PlaySessionApi.start(playthroughUid);
      const next = await fetchActivePlaythroughs();
      setRows(next);
    } catch {
      setError('Failed to start tracking.');
    } finally {
      setActionUid(null);
    }
  };

  const handleStop = async (playthroughUid: string) => {
    setActionUid(playthroughUid);
    try {
      await PlaySessionApi.stop(playthroughUid);
      const next = await fetchActivePlaythroughs();
      setRows(next);
    } catch {
      setError('Failed to stop tracking.');
    } finally {
      setActionUid(null);
    }
  };

  if (!isLoaded) return null;
  if (loading) return <CircularProgress />;
  if (error)
    return <Typography color="error">{error}</Typography>;

  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data.playthroughStates ?? [];

  const typeName = (uid: string) =>
    playthroughTypes.find((t) => t.uid === uid)?.name ?? uid;
  const stateName = (uid: string) =>
    playthroughStates.find((s) => s.uid === uid)?.name ?? uid;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Active Playthroughs
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        What am I actively playing right now?
      </Typography>

      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No active playthroughs.
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {rows.map((row) => (
            <Box
              key={row.playthroughUid}
              border={1}
              borderRadius={2}
              p={2}
              sx={{ borderColor: 'divider' }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                {row.thumbnailImageUid ? (
                  <Box
                    component="img"
                    src={`${THUMBNAIL_BASE}/${row.thumbnailImageUid}`}
                    alt=""
                    width={64}
                    height={64}
                    sx={{
                      objectFit: 'cover',
                      borderRadius: 1,
                      bgcolor: 'grey.300',
                    }}
                  />
                ) : (
                  <Box
                    width={64}
                    height={64}
                    bgcolor="grey.300"
                    sx={{ borderRadius: 1 }}
                  />
                )}
                <Box flexGrow={1} minWidth={0}>
                  <Typography variant="subtitle1" component="span">
                    <Button
                      component={Link}
                      to={`/playthroughs/${row.playthroughUid}`}
                      color="primary"
                      sx={{ p: 0, textTransform: 'none', fontSize: 'inherit' }}
                    >
                      {row.displayName}
                    </Button>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {typeName(row.playthroughTypeUid)} ·{' '}
                    {stateName(row.playthroughStateUid)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPlaytime(row.totalPlaytimeSeconds)}
                    {row.isTimeTrackingActive && ' · Tracking'}
                  </Typography>
                  {(row.currentSessionStartedAt ?? row.lastStoppedAt) && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {row.isTimeTrackingActive && row.currentSessionStartedAt
                        ? `Started: ${formatTimestamp(row.currentSessionStartedAt)}`
                        : row.lastStoppedAt
                          ? `Last stopped: ${formatTimestamp(row.lastStoppedAt)}`
                          : null}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  {row.isTimeTrackingActive ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleStop(row.playthroughUid)}
                      disabled={actionUid === row.playthroughUid}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleStart(row.playthroughUid)}
                      disabled={actionUid === row.playthroughUid}
                    >
                      Start
                    </Button>
                  )}
                  <Button
                    component={Link}
                    to={`/playthroughs/${row.playthroughUid}`}
                    variant="outlined"
                    size="small"
                  >
                    Details
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
