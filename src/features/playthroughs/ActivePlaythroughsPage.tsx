import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { fetchActivePlaythroughs } from '../../services/activePlaythroughsApi';
import { PlaySessionApi } from '../../services/playSessionApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import PlaythroughCard from './PlaythroughCard';
import type { ActivePlaythroughOverviewRow } from '../../types/dto';

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
    setError(null);
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
    setError(null);
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
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }
  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const typeName = (uid: string) =>
    playthroughTypes.find((t) => t.uid === uid)?.name ?? uid;

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
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {rows.map((row) => (
            <Grid item key={row.playthroughUid} xs={12} sm={6} md={4} lg={3}>
              <PlaythroughCard
                row={row}
                playthroughTypeName={typeName(row.playthroughTypeUid)}
                onStart={handleStart}
                onStop={handleStop}
                isActionDisabled={actionUid === row.playthroughUid}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
