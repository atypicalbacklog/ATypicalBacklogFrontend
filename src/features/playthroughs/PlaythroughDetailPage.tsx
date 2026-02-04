import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { PlaythroughApi } from '../../services/playthroughApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { PlaythroughDTO, UpdatePlaythroughRequest } from '../../types/dto';

export default function PlaythroughDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const { referenceData, isLoaded } = useReferenceData();
  const [playthrough, setPlaythrough] = useState<PlaythroughDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [playthroughTypeUid, setPlaythroughTypeUid] = useState('');
  const [inputUid, setInputUid] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [playthroughStateUid, setPlaythroughStateUid] = useState('');

  useEffect(() => {
    if (!uid) return;
    PlaythroughApi.get(uid)
      .then((p) => {
        setPlaythrough(p);
        setPlaythroughTypeUid(p.playthroughTypeUid);
        setInputUid(p.inputUid);
        setStartedAt(p.startedAt);
        setPlaythroughStateUid(p.playthroughStateUid);
      })
      .catch(() => setError('Failed to load playthrough.'))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setSubmitting(true);
    setError(null);
    PlaythroughApi.update(uid, {
      playthroughTypeUid,
      inputUid,
      startedAt,
      playthroughStateUid,
    })
      .then(setPlaythrough)
      .catch(() => setError('Failed to update.'))
      .finally(() => setSubmitting(false));
  };

  if (!isLoaded) return null;
  if (loading) return <CircularProgress />;
  if (error || !playthrough)
    return <Typography color="error">{error ?? 'Playthrough not found'}</Typography>;

  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data.playthroughStates ?? [];
  const inputs = referenceData?.data.inputs ?? [];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Edit Playthrough</Typography>
        <Button component={Link} to="/play-activity/active" size="small">
          Back to Active
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Correction flow — fix type, input, state, or start date. Backend
        validates allowed values.
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
        maxWidth={400}
        mt={2}
      >
        <FormControl fullWidth required>
          <InputLabel>Playthrough type</InputLabel>
          <Select
            label="Playthrough type"
            value={playthroughTypeUid}
            onChange={(e) => setPlaythroughTypeUid(e.target.value)}
          >
            {playthroughTypes.map((t) => (
              <MenuItem key={t.uid} value={t.uid}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth required>
          <InputLabel>Input</InputLabel>
          <Select
            label="Input"
            value={inputUid}
            onChange={(e) => setInputUid(e.target.value)}
          >
            {inputs.map((i) => (
              <MenuItem key={i.uid} value={i.uid}>
                {i.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="date"
          label="Started at"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />

        <FormControl fullWidth required>
          <InputLabel>Playthrough state</InputLabel>
          <Select
            label="Playthrough state"
            value={playthroughStateUid}
            onChange={(e) => setPlaythroughStateUid(e.target.value)}
          >
            {playthroughStates.map((s) => (
              <MenuItem key={s.uid} value={s.uid}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
}
