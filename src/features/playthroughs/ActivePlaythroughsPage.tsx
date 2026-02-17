import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Checkbox,
  Grid,
  Typography,
} from '@mui/material';
import {
  fetchActivePlaythroughs,
  searchPlaythroughHistory,
  type PlaythroughHistorySearchRequest,
} from '../../services/activePlaythroughsApi';
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
  const [showHistorySearch, setShowHistorySearch] = useState(false);
  const [historyRows, setHistoryRows] = useState<ActivePlaythroughOverviewRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyName, setHistoryName] = useState('');
  const [historyStateUid, setHistoryStateUid] = useState<string>('');
  const [historyTypeUid, setHistoryTypeUid] = useState<string>('');
  const [historyYear, setHistoryYear] = useState<string>('');

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

  const handleAddRetroactive = async (
    playthroughUid: string,
    payload: { date: string; minuteCount: number }
  ) => {
    setActionUid(playthroughUid);
    setError(null);
    try {
      await PlaySessionApi.retroactive(playthroughUid, payload);
      const next = await fetchActivePlaythroughs();
      setRows(next);
    } catch {
      setError('Failed to add overlooked booking.');
    } finally {
      setActionUid(null);
    }
  };

  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data.playthroughStates ?? [];
  const typeName = (uid: string) =>
    playthroughTypes.find((t) => t.uid === uid)?.name ?? uid;
  const activeStateUid =
    playthroughStates.find((s) => s.name === 'Active')?.uid ?? null;
  const historyStateOptions = playthroughStates.filter(
    (s) => s.uid !== activeStateUid
  );

  const handleToggleHistorySearch = (checked: boolean) => {
    setShowHistorySearch(checked);
    setHistoryRows([]);
    setHistoryError(null);
    setHistoryName('');
    setHistoryYear('');
    if (checked) {
      // Default required state: first non-Active state, if available
      if (!historyStateUid && historyStateOptions.length > 0) {
        setHistoryStateUid(historyStateOptions[0].uid);
      }
    } else {
      // Reset filters and reload active playthroughs when turning history search off
      setHistoryStateUid('');
      setHistoryTypeUid('');
      setLoading(true);
      setError(null);
      fetchActivePlaythroughs()
        .then(setRows)
        .catch(() => setError('Failed to load active playthroughs.'))
        .finally(() => setLoading(false));
    }
  };

  const handleHistorySearch = useCallback(async () => {
    if (!showHistorySearch) {
      return;
    }
    if (!historyStateUid) {
      setHistoryRows([]);
      setHistoryError('Playthrough state is required.');
      return;
    }
    const body: PlaythroughHistorySearchRequest = {
      name: historyName.trim() || null,
      playthroughStateUid: historyStateUid,
      playthroughTypeUid: historyTypeUid || null,
      year: historyYear ? Number(historyYear) : null,
    };
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const result = await searchPlaythroughHistory(body);
      setHistoryRows(result);
    } catch {
      setHistoryError('Failed to search playthrough history.');
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [showHistorySearch, historyName, historyStateUid, historyTypeUid, historyYear]);

  useEffect(() => {
    if (!showHistorySearch) return;
    const id = setTimeout(() => {
      void handleHistorySearch();
    }, 300);
    return () => clearTimeout(id);
  }, [showHistorySearch, historyName, historyStateUid, historyTypeUid, historyYear, handleHistorySearch]);

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Active Playthroughs
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        What am I actively playing right now?
      </Typography>

      {/* Search old playthroughs (history) at top */}
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showHistorySearch}
              onChange={(e) => handleToggleHistorySearch(e.target.checked)}
            />
          }
          label="Search old playthroughs"
        />
        {showHistorySearch && (
          <Box sx={{ mt: 1 }}>
            {historyError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setHistoryError(null)}
              >
                {historyError}
              </Alert>
            )}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'flex-end' }}
            >
              <TextField
                label="Name"
                value={historyName}
                onChange={(e) => setHistoryName(e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Playthrough type</InputLabel>
                <Select
                  label="Playthrough type"
                  value={historyTypeUid}
                  onChange={(e) => setHistoryTypeUid(e.target.value)}
                >
                  {playthroughTypes.map((t) => (
                    <MenuItem key={t.uid} value={t.uid}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>State (excl. Active)</InputLabel>
                <Select
                  label="State (excl. Active)"
                  value={historyStateUid}
                  onChange={(e) => setHistoryStateUid(e.target.value)}
                >
                  {historyStateOptions.map((s) => (
                    <MenuItem key={s.uid} value={s.uid}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Year"
                value={historyYear}
                onChange={(e) => setHistoryYear(e.target.value)}
                size="small"
                sx={{ width: 100 }}
                inputProps={{ inputMode: 'numeric', pattern: '\\d*' }}
              />
            </Stack>

            {historyLoading && (
              <Stack alignItems="center" sx={{ py: 2 }}>
                <CircularProgress size={24} />
              </Stack>
            )}

            {historyRows.length > 0 && !historyLoading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Matching playthroughs
                </Typography>
                <Grid container spacing={2}>
                  {historyRows.map((row) => (
                    <Grid
                      item
                      key={`history-${row.playthroughUid}`}
                      xs={12}
                      sm={6}
                      md={4}
                      lg={2}
                    >
                      <PlaythroughCard
                        row={row}
                        playthroughTypeName={typeName(row.playthroughTypeUid)}
                        onStart={handleStart}
                        onStop={handleStop}
                        onAddRetroactive={handleAddRetroactive}
                        isActionDisabled={actionUid === row.playthroughUid}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {!showHistorySearch &&
        (rows.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No active playthroughs.
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {rows.map((row) => (
              <Grid item key={row.playthroughUid} xs={12} sm={6} md={4} lg={2}>
                <PlaythroughCard
                  row={row}
                  playthroughTypeName={typeName(row.playthroughTypeUid)}
                  onStart={handleStart}
                  onStop={handleStop}
                  onAddRetroactive={handleAddRetroactive}
                  isActionDisabled={actionUid === row.playthroughUid}
                />
              </Grid>
            ))}
          </Grid>
        ))}
    </Box>
  );
}
