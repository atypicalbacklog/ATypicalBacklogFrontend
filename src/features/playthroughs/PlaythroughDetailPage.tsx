import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PlaythroughApi } from '../../services/playthroughApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { BacklogApi } from '../../services/backlogApi';
import { GameCompletionApi } from '../../services/gameCompletionApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type {
  PlaythroughDTO,
  GameInstanceDetailDTO,
} from '../../types/dto';

export default function PlaythroughDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const { referenceData, isLoaded } = useReferenceData();
  const [playthrough, setPlaythrough] = useState<PlaythroughDTO | null>(null);
  const [instance, setInstance] = useState<GameInstanceDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [playthroughTypeUid, setPlaythroughTypeUid] = useState('');
  const [inputUid, setInputUid] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [playthroughStateUid, setPlaythroughStateUid] = useState('');

  // Backlog (for game linked to this playthrough's instance)
  const [addDate, setAddDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [addReason, setAddReason] = useState('');
  const [backlogSubmitting, setBacklogSubmitting] = useState(false);
  const [reasonEdit, setReasonEdit] = useState('');
  const [reasonSubmitting, setReasonSubmitting] = useState(false);

  // Completions (for game instance)
  const [completionStateUid, setCompletionStateUid] = useState('');
  const [completionInfo, setCompletionInfo] = useState('');
  const [completionSubmitting, setCompletionSubmitting] = useState(false);

  useEffect(() => {
    if (!uid) return;
    PlaythroughApi.get(uid)
      .then((p) => {
        setPlaythrough(p);
        setPlaythroughTypeUid(p.playthroughTypeUid);
        setInputUid(p.inputUid);
        setStartedAt(p.startedAt);
        setPlaythroughStateUid(p.playthroughStateUid);
        return GameInstanceApi.get(p.gameInstanceUid);
      })
      .then((inst) => {
        setInstance(inst);
        const currentBacklog = inst.backlogEntries?.find((e) => !e.removedDate);
        if (currentBacklog) setReasonEdit(currentBacklog.reason);
      })
      .catch(() => setError('Failed to load playthrough.'))
      .finally(() => setLoading(false));
  }, [uid]);

  const refetchInstance = useCallback(() => {
    if (!playthrough) return;
    GameInstanceApi.get(playthrough.gameInstanceUid)
      .then((inst) => {
        setInstance(inst);
        const currentBacklog = inst.backlogEntries?.find((e) => !e.removedDate);
        if (currentBacklog) setReasonEdit(currentBacklog.reason);
      })
      .catch(() => {});
  }, [playthrough]);

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

  const gameUid = instance?.gameUid;
  const backlogEntries = instance?.backlogEntries ?? [];
  const backlog = backlogEntries.find((e) => !e.removedDate) ?? null;

  const handleAddToBacklog = async () => {
    if (!gameUid) return;
    setBacklogSubmitting(true);
    setError(null);
    try {
      await BacklogApi.add(gameUid, addDate, addReason);
      refetchInstance();
    } catch {
      setError('Failed to add to backlog.');
    } finally {
      setBacklogSubmitting(false);
    }
  };

  const handleRemoveFromBacklog = async () => {
    if (!gameUid) return;
    setBacklogSubmitting(true);
    setError(null);
    const removedDate = new Date().toISOString().slice(0, 10);
    try {
      await BacklogApi.remove(gameUid, removedDate);
      refetchInstance();
    } catch {
      setError('Failed to remove from backlog.');
    } finally {
      setBacklogSubmitting(false);
    }
  };

  const handleUpdateBacklogReason = async () => {
    if (!backlog) return;
    setReasonSubmitting(true);
    setError(null);
    try {
      await BacklogApi.updateReason(backlog.uid, reasonEdit);
      refetchInstance();
    } catch {
      setError('Failed to update reason.');
    } finally {
      setReasonSubmitting(false);
    }
  };

  const handleSetCompletion = async () => {
    if (!playthrough?.gameInstanceUid || !completionStateUid) return;
    setCompletionSubmitting(true);
    setError(null);
    try {
      await GameCompletionApi.update(
        playthrough.gameInstanceUid,
        completionStateUid,
        completionInfo ?? ''
      );
      refetchInstance();
      setCompletionStateUid('');
      setCompletionInfo('');
    } catch {
      setError('Failed to set completion.');
    } finally {
      setCompletionSubmitting(false);
    }
  };

  if (!isLoaded) return null;
  if (loading) return <CircularProgress />;
  if (error && !playthrough)
    return <Typography color="error">{error}</Typography>;
  if (!playthrough)
    return <Typography color="error">Playthrough not found</Typography>;

  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data.playthroughStates ?? [];
  const inputs = referenceData?.data.inputs ?? [];
  const completionStates = referenceData?.data.completionStates ?? [];
  const completionStateName = (u: string) =>
    completionStates.find((c) => c.uid === u)?.name ?? u;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Edit Playthrough</Typography>
        <Button component={Link} to="/play-activity/active" size="small">
          Back to Active
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Correction flow — fix type, input, state, or start date. Backend
        validates allowed values.
      </Typography>

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

      {/* Backlog (Game) — link to backlog entry and update state */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Backlog (Game)
        </Typography>
        {!gameUid ? (
          <Typography variant="body2" color="text.secondary">
            No game linked to this instance.
          </Typography>
        ) : backlog ? (
          <Stack spacing={2} maxWidth={400}>
            <Typography variant="body2">
              Added: {backlog.addedDate}
              {backlog.removedDate != null &&
                ` · Removed: ${backlog.removedDate}`}
            </Typography>
            <Stack direction="row" gap={2} alignItems="flex-start" flexWrap="wrap">
              <TextField
                label="Reason"
                value={reasonEdit}
                onChange={(e) => setReasonEdit(e.target.value)}
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleUpdateBacklogReason}
                disabled={
                  reasonSubmitting ||
                  reasonEdit === backlog.reason ||
                  !reasonEdit.trim()
                }
              >
                Update reason
              </Button>
            </Stack>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleRemoveFromBacklog}
              disabled={backlogSubmitting}
            >
              Remove from backlog
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2} maxWidth={400}>
            <TextField
              type="date"
              label="Added date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
            <TextField
              label="Reason"
              value={addReason}
              onChange={(e) => setAddReason(e.target.value)}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddToBacklog}
              disabled={backlogSubmitting || !addReason.trim()}
            >
              Add to backlog
            </Button>
          </Stack>
        )}
      </Box>

      {/* Game completion (instance) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Game completion
        </Typography>
        {instance && instance.completions.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {instance.completions.map((c) => (
              <Typography
                key={c.uid}
                variant="body2"
                color="text.secondary"
                gutterBottom
                component="div"
              >
                {completionStateName(c.completionStateUid)}
                {c.info ? ` — ${c.info}` : ''}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No completion set
          </Typography>
        )}
        <Stack spacing={2} direction="row" flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Completion state</InputLabel>
            <Select
              label="Completion state"
              value={completionStateUid}
              onChange={(e) => setCompletionStateUid(e.target.value)}
            >
              {completionStates.map((c) => (
                <MenuItem key={c.uid} value={c.uid}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Info"
            value={completionInfo}
            onChange={(e) => setCompletionInfo(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSetCompletion}
            disabled={completionSubmitting || !completionStateUid}
          >
            Set completion
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
