import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { GameApi } from '../../services/gameApi';
import { BacklogApi } from '../../services/backlogApi';
import { GameCompletionApi } from '../../services/gameCompletionApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { GameInstanceDetailDTO, UpdateGameInstanceRequest } from '../../types/dto';
import { GameDTO } from '../../types/dto';
import GameInstanceForm from './GameInstanceForm';
import PlaySessionControls from '../playSessions/PlaySessionControls';

export default function GameInstanceDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const { referenceData, isLoaded } = useReferenceData();
  const [instance, setInstance] = useState<GameInstanceDetailDTO | null>(null);
  const [game, setGame] = useState<GameDTO | null>(null);
  const [showUids, setShowUids] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backlog form (add)
  const [addDate, setAddDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [addReason, setAddReason] = useState('');
  const [backlogSubmitting, setBacklogSubmitting] = useState(false);
  // Backlog form (update reason)
  const [reasonEdit, setReasonEdit] = useState('');
  const [reasonSubmitting, setReasonSubmitting] = useState(false);
  // Completion form
  const [completionStateUid, setCompletionStateUid] = useState('');
  const [completionInfo, setCompletionInfo] = useState('');
  const [completionSubmitting, setCompletionSubmitting] = useState(false);

  useEffect(() => {
    if (!uid) return;
    GameInstanceApi.get(uid)
      .then((inst) => {
        setInstance(inst);
        if (inst.gameUid) {
          GameApi.get(inst.gameUid).then(setGame).catch(() => {});
        }
        if (inst.backlog) setReasonEdit(inst.backlog.reason);
      })
      .catch(() => setError('Failed to load game instance'))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleUpdate = (data: UpdateGameInstanceRequest) => {
    if (!uid) return;
    return GameInstanceApi.update(uid, data).then(setInstance);
  };

  const refetchInstance = () => {
    if (!uid) return;
    GameInstanceApi.get(uid).then(setInstance).catch(() => {});
  };

  const backlog = instance?.backlog ?? null;
  const gameUid = instance?.gameUid;

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
    if (!uid || !completionStateUid) return;
    setCompletionSubmitting(true);
    setError(null);
    try {
      await GameCompletionApi.update(uid, completionStateUid, completionInfo);
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
  if (error && !instance)
    return <Typography color="error">{error}</Typography>;
  if (!instance)
    return <Typography color="error">Game instance not found</Typography>;

  const completionStates = referenceData?.data.completionStates ?? [];
  const completionStateName = (uid: string) =>
    completionStates.find((c) => c.uid === uid)?.name ?? uid;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Game Instance</Typography>
        <Button component={Link} to="/" size="small">
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {game && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Game (read-only)
          </Typography>
          <Typography variant="body1">{game.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            First release: {game.firstReleaseDate}
          </Typography>
        </Box>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        component="button"
        type="button"
        onClick={() => setShowUids((v) => !v)}
        sx={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'underline',
          mb: 2,
          display: 'block',
        }}
      >
        {showUids ? 'Hide UIDs' : 'Show UIDs'}
      </Typography>
      <Collapse in={showUids}>
        <Typography
          variant="caption"
          color="text.secondary"
          component="pre"
          sx={{ mb: 2 }}
        >
          gameUid: {instance.gameUid}
          {'\n'}platformUid: {instance.platformUid}
          {'\n'}variantUid: {instance.variantUid}
        </Typography>
      </Collapse>

      <GameInstanceForm
        mode="update"
        initial={instance}
        onSubmit={handleUpdate}
        submitLabel="Update"
      />

      {/* Backlog section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Backlog
        </Typography>
        {backlog ? (
          <Stack spacing={2} maxWidth={400}>
            <Typography variant="body2">
              Added: {backlog.addedDate}
              {backlog.removedDate != null &&
                ` · Removed: ${backlog.removedDate}`}
            </Typography>
            <Box display="flex" gap={2} alignItems="flex-start">
              <TextField
                label="Reason"
                value={reasonEdit}
                onChange={(e) => setReasonEdit(e.target.value)}
                fullWidth
                size="small"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleUpdateBacklogReason}
                disabled={
                  reasonSubmitting ||
                  reasonEdit === backlog.reason ||
                  !reasonEdit
                }
              >
                Update reason
              </Button>
            </Box>
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
              disabled={backlogSubmitting || !addReason}
            >
              Add to backlog
            </Button>
          </Stack>
        )}
      </Box>

      {/* Completions section (from instance detail) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Completions
        </Typography>
        {instance.completions.length > 0 ? (
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

      {uid && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Play session
          </Typography>
          <PlaySessionControls playthroughUid={uid} />
        </Box>
      )}
    </Box>
  );
}
