import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
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
import { DlcApi, type DlcDto } from '../../services/dlcApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import CompletionBar from '../shared/CompletionBar';
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
  const [removedDate, setRemovedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Completions (for game instance; dates saved with GameCompletion)
  const [completionStateUid, setCompletionStateUid] = useState('');
  const [completionInfo, setCompletionInfo] = useState('');
  const [completionFinishedDate, setCompletionFinishedDate] = useState('');
  const [completionCompletedDate, setCompletionCompletedDate] = useState('');
  const [completionSubmitting, setCompletionSubmitting] = useState(false);

  // DLCs for this game instance (linked to playthrough = this uid)
  const [dlcs, setDlcs] = useState<DlcDto[]>([]);
  const [dlcUpdatingUid, setDlcUpdatingUid] = useState<string | null>(null);
  /** Per-DLC completion state edit (dlc.uid -> completionStateUid) for "Update" button. */
  const [dlcCompletionEdit, setDlcCompletionEdit] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!uid) return;
    PlaythroughApi.get(uid)
      .then((p) => {
        setPlaythrough(p);
        setPlaythroughTypeUid(p.playthroughTypeUid);
        setInputUid(p.inputUid);
        setStartedAt(p.startedAt);
        setPlaythroughStateUid(p.playthroughStateUid);
        return Promise.all([
          GameInstanceApi.get(p.gameInstanceUid),
          DlcApi.getByGameInstance(p.gameInstanceUid),
        ]);
      })
      .then(([inst, dlcList]) => {
        setInstance(inst);
        setDlcs(dlcList ?? []);
        const currentBacklog = inst.backlogEntries?.find((e) => !e.removedDate);
        if (currentBacklog) setReasonEdit(currentBacklog.reason);
        const mainComp = inst.completions?.find((c) => !c.dlcUid);
        if (mainComp) {
          setCompletionStateUid(mainComp.completionStateUid);
          setCompletionInfo(mainComp.info ?? '');
          setCompletionFinishedDate(mainComp.finishedDate ?? '');
          setCompletionCompletedDate(mainComp.completedDate ?? '');
        }
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
        const mainComp = inst.completions?.find((c) => !c.dlcUid);
        if (mainComp) {
          setCompletionStateUid(mainComp.completionStateUid);
          setCompletionInfo(mainComp.info ?? '');
          setCompletionFinishedDate(mainComp.finishedDate ?? '');
          setCompletionCompletedDate(mainComp.completedDate ?? '');
        }
      })
      .catch(() => {});
  }, [playthrough]);

  const refetchDlcs = useCallback(() => {
    if (!playthrough) return;
    DlcApi.getByGameInstance(playthrough.gameInstanceUid)
      .then((list) => setDlcs(list ?? []))
      .catch(() => {});
  }, [playthrough]);

  const handleDlcPlaythroughToggle = useCallback(
    async (dlc: DlcDto, linked: boolean) => {
      if (!uid) return;
      setDlcUpdatingUid(dlc.uid);
      setError(null);
      try {
        if (linked) {
          await DlcApi.update(dlc.uid, { playthroughUid: uid });
        } else {
          await DlcApi.update(dlc.uid, { removePreviousPlaythrough: true });
        }
        refetchDlcs();
      } catch {
        setError('Failed to update DLC link.');
      } finally {
        setDlcUpdatingUid(null);
      }
    },
    [uid, refetchDlcs]
  );

  const handleDlcCompletionChange = useCallback((dlcUid: string, completionStateUid: string) => {
    setDlcCompletionEdit((prev) => ({ ...prev, [dlcUid]: completionStateUid }));
  }, []);

  const handleDlcCompletionUpdate = useCallback(
    async (dlc: DlcDto) => {
      const value = dlcCompletionEdit[dlc.uid] ?? dlc.completionStateUid ?? '';
      setDlcUpdatingUid(dlc.uid);
      setError(null);
      try {
        await DlcApi.update(dlc.uid, { completionStateUid: value || null });
        refetchDlcs();
        setDlcCompletionEdit((prev) => {
          const next = { ...prev };
          delete next[dlc.uid];
          return next;
        });
      } catch {
        setError('Failed to update DLC completion.');
      } finally {
        setDlcUpdatingUid(null);
      }
    },
    [dlcCompletionEdit, refetchDlcs]
  );

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
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
        completionInfo ?? '',
        undefined,
        {
          finishedDate: completionFinishedDate || null,
          completedDate: completionCompletedDate || null,
        }
      );
      refetchInstance();
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

      {/* Panel: playthrough metadata + DLC + update button */}
      <Box
        sx={(theme) => ({
          mt: 2,
          p: 2,
          maxWidth: 700,
          borderRadius: 1,
          bgcolor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[100],
        })}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={2}
          maxWidth={400}
        >
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth required sx={{ flex: 1 }}>
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

            <TextField
              type="date"
              label="Started at"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
              sx={{ flex: 1 }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth required sx={{ flex: 1 }}>
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

            <FormControl fullWidth required sx={{ flex: 1 }}>
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
          </Stack>
        </Box>

        {/* Manage DLC to playthrough + completion state per DLC */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Manage DLC to playthrough
          </Typography>
          {dlcs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No DLCs for this game instance.
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ maxWidth: 560 }}>
              {dlcs.map((dlc) => {
                const linked = dlc.playthroughUid === uid;
                const updating = dlcUpdatingUid === dlc.uid;
                const currentCompletion = dlc.completionStateUid ?? '';
                const editCompletion = dlcCompletionEdit[dlc.uid] ?? currentCompletion;
                const completionDirty = editCompletion !== currentCompletion;
                return (
                  <Box
                    key={dlc.uid}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 2,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={linked}
                            disabled={updating}
                            onChange={() => handleDlcPlaythroughToggle(dlc, !linked)}
                          />
                        }
                        label={dlc.name}
                      />
                      <CompletionBar
                        completionState={
                          dlc.completionStateUid
                            ? completionStateName(dlc.completionStateUid)
                            : 'Backlog'
                        }
                        playthroughState={null}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 2,
                        mt: 1,
                        width: '100%',
                      }}
                    >
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Completion</InputLabel>
                        <Select
                          label="Completion"
                          value={editCompletion}
                          disabled={updating}
                          onChange={(e) => handleDlcCompletionChange(dlc.uid, e.target.value)}
                        >
                          {completionStates.map((c) => (
                            <MenuItem key={c.uid} value={c.uid}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={updating || !completionDirty}
                        onClick={() => handleDlcCompletionUpdate(dlc)}
                      >
                        Set Completion
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Update playthrough main fields */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={() => handleSubmit()}
          >
            {submitting ? 'Updating…' : 'Update Playthrough'}
          </Button>
        </Box>
      </Box>

      {/* Panel: backlog + game completion */}
      <Box
        sx={(theme) => ({
          mt: 4,
          p: 2,
          maxWidth: 700,
          borderRadius: 1,
          bgcolor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[100],
        })}
      >
        {/* Backlog (Game) — link to backlog entry and update state */}
        <Box>
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
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField
                  type="date"
                  label="Removed date"
                  value={removedDate}
                  onChange={(e) => setRemovedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 160 }}
                />
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
                disabled={backlogSubmitting || !addDate}
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
          {instance && (() => {
            const mainCompletion = instance.completions.find((c) => !c.dlcUid);
            const completionState =
              mainCompletion
                ? completionStateName(mainCompletion.completionStateUid)
                : 'Backlog';
            const playthroughState =
              playthroughStates.find((s) => s.uid === playthroughStateUid)?.name ?? null;
            return (
              <Box sx={{ mb: 2 }}>
                <CompletionBar
                  completionState={completionState}
                  playthroughState={playthroughState}
                />
                {mainCompletion?.info && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {mainCompletion.info}
                  </Typography>
                )}
              </Box>
            );
          })()}
          <Grid container spacing={2} alignItems="center">
            {/* Top row: completion state select + info */}
            <Grid item xs={6} sm={6}>
              <FormControl size="small" fullWidth>
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
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                label="Info"
                value={completionInfo}
                onChange={(e) => setCompletionInfo(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            {/* Bottom row: finished date + completed date + Set completion button */}
            <Grid item xs={6} sm={4}>
              <TextField
                type="date"
                label="Finished date"
                value={completionFinishedDate}
                onChange={(e) => setCompletionFinishedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                type="date"
                label="Completed date"
                value={completionCompletedDate}
                onChange={(e) => setCompletionCompletedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSetCompletion}
                disabled={completionSubmitting || !completionStateUid}
              >
                Set Completion
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
