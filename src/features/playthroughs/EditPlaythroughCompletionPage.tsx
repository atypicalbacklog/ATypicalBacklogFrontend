import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { PlaythroughApi } from '../../services/playthroughApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { DlcApi, type DlcDto } from '../../services/dlcApi';
import { getTimeBookingsByPlaythrough } from '../../services/timeBookingApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import CompletionBar from '../shared/CompletionBar';
import SmartImage from '../shared/SmartImage';
import BacklogInfoBlock from '../gameInstances/overview/BacklogInfoBlock';
import type {
  PlaythroughDTO,
  GameInstanceDetailDTO,
  GameCompletionDTO,
  UpdatePlaythroughCompletionGameCompletion,
  UpdatePlaythroughCompletionRequest,
} from '../../types/dto';

/** Convert an ISO instant to a local YYYY-MM-DD string. */
function isoToLocalDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface DlcEditState {
  link: boolean;
  completionStateUid: string;
  info: string;
  finishedDate: string;
  completedDate: string;
}

export default function EditPlaythroughCompletionPage() {
  const { uid } = useParams<{ uid: string }>();
  const { referenceData, isLoaded } = useReferenceData();

  const [playthrough, setPlaythrough] = useState<PlaythroughDTO | null>(null);
  const [instance, setInstance] = useState<GameInstanceDetailDTO | null>(null);
  const [dlcs, setDlcs] = useState<DlcDto[]>([]);
  const [lastBookingDate, setLastBookingDate] = useState<string>('');
  const [linkedPlaythroughs, setLinkedPlaythroughs] = useState<Record<string, PlaythroughDTO>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Playthrough metadata
  const [playthroughTypeUid, setPlaythroughTypeUid] = useState('');
  const [inputUid, setInputUid] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [playthroughStateUid, setPlaythroughStateUid] = useState('');

  // Backlog (current active entry)
  const [backlogRemovedDate, setBacklogRemovedDate] = useState('');
  const [backlogReason, setBacklogReason] = useState('');

  // Main game completion (instance, dlcUid null)
  const [mainCompletionStateUid, setMainCompletionStateUid] = useState('');
  const [mainInfo, setMainInfo] = useState('');
  const [mainFinishedDate, setMainFinishedDate] = useState('');
  const [mainCompletedDate, setMainCompletedDate] = useState('');

  // Per-DLC edits keyed by dlc.uid
  const [dlcEdits, setDlcEdits] = useState<Record<string, DlcEditState>>({});

  const completionByDlc = useMemo(() => {
    const map = new Map<string, GameCompletionDTO>();
    (instance?.completions ?? []).forEach((c) => {
      if (c.dlcUid) map.set(c.dlcUid, c);
    });
    return map;
  }, [instance]);

  const mainCompletion = useMemo(
    () => instance?.completions.find((c) => !c.dlcUid) ?? null,
    [instance]
  );

  useEffect(() => {
    if (!uid) return;
    const key = `playthrough-complete-${uid}`;
    if (!initialFetchBegin(key)) return;
    setLoading(true);
    setError(null);

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
          getTimeBookingsByPlaythrough(uid),
        ]);
      })
      .then(([inst, dlcList, bookings]) => {
        setInstance(inst);
        setDlcs(dlcList ?? []);

        const mainComp = inst.completions?.find((c) => !c.dlcUid);
        if (mainComp) {
          setMainCompletionStateUid(mainComp.completionStateUid);
          setMainInfo(mainComp.info ?? '');
          setMainFinishedDate(mainComp.finishedDate ?? '');
          setMainCompletedDate(mainComp.completedDate ?? '');
        }

        const currentBacklog = inst.backlogEntries?.find((e) => !e.removedDate);
        if (currentBacklog) {
          setBacklogReason(currentBacklog.reason ?? '');
          setBacklogRemovedDate(currentBacklog.removedDate ?? '');
        }

        // Last time booking date (latest endTime, fallback startTime).
        const latestIso = (bookings ?? []).reduce<string | null>((acc, b) => {
          const candidate = b.endTime ?? b.startTime;
          if (!candidate) return acc;
          if (!acc || candidate > acc) return candidate;
          return acc;
        }, null);
        setLastBookingDate(isoToLocalDate(latestIso));

        // Seed per-DLC edit state.
        const edits: Record<string, DlcEditState> = {};
        (dlcList ?? []).forEach((dlc) => {
          const comp = inst.completions?.find((c) => c.dlcUid === dlc.uid);
          edits[dlc.uid] = {
            link: dlc.playthroughUid === uid,
            completionStateUid: comp?.completionStateUid ?? dlc.completionStateUid ?? '',
            info: comp?.info ?? '',
            finishedDate: comp?.finishedDate ?? dlc.finishedDate ?? '',
            completedDate: comp?.completedDate ?? dlc.completedDate ?? '',
          };
        });
        setDlcEdits(edits);

        // Fetch playthroughs linked to DLCs (other than this one) for display.
        const otherUids = Array.from(
          new Set(
            (dlcList ?? [])
              .map((d) => d.playthroughUid)
              .filter((p): p is string => !!p && p !== uid)
          )
        );
        if (otherUids.length > 0) {
          Promise.all(
            otherUids.map((pUid) =>
              PlaythroughApi.get(pUid)
                .then((p) => [pUid, p] as const)
                .catch(() => null)
            )
          ).then((entries) => {
            const map: Record<string, PlaythroughDTO> = {};
            entries.forEach((e) => {
              if (e) map[e[0]] = e[1];
            });
            setLinkedPlaythroughs(map);
          });
        }
      })
      .catch(() => setError('Failed to load playthrough.'))
      .finally(() => {
        setLoading(false);
        initialFetchEnd(key);
      });
  }, [uid]);

  const updateDlcEdit = useCallback(
    (dlcUid: string, patch: Partial<DlcEditState>) => {
      setDlcEdits((prev) => ({
        ...prev,
        [dlcUid]: { ...prev[dlcUid], ...patch },
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!uid || !instance) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const gameCompletions: UpdatePlaythroughCompletionGameCompletion[] = [];

      if (mainCompletion) {
        gameCompletions.push({
          uid: mainCompletion.uid,
          completionStateUid: mainCompletionStateUid || null,
          info: mainInfo || null,
          finishedDate: mainFinishedDate || null,
          completedDate: mainCompletedDate || null,
        });
      }

      const dlcUidsToLink: string[] = [];
      dlcs.forEach((dlc) => {
        const edit = dlcEdits[dlc.uid];
        if (!edit) return;
        if (edit.link) {
          if (dlc.playthroughUid !== uid) dlcUidsToLink.push(dlc.uid);
          const comp = completionByDlc.get(dlc.uid);
          if (comp) {
            gameCompletions.push({
              uid: comp.uid,
              dlcUid: dlc.uid,
              completionStateUid: edit.completionStateUid || null,
              info: edit.info || null,
              finishedDate: edit.finishedDate || null,
              completedDate: edit.completedDate || null,
            });
          }
        }
      });

      const currentBacklog = instance.backlogEntries?.find((e) => !e.removedDate);

      const request: UpdatePlaythroughCompletionRequest = {
        playthrough: {
          playthroughTypeUid: playthroughTypeUid || null,
          inputUid: inputUid || null,
          startedAt: startedAt || null,
          playthroughStateUid: playthroughStateUid || null,
        },
        gameCompletions: gameCompletions.length > 0 ? gameCompletions : undefined,
        dlcUids: dlcUidsToLink.length > 0 ? dlcUidsToLink : undefined,
        backlog: currentBacklog
          ? {
              uid: currentBacklog.uid,
              removedDate: backlogRemovedDate || null,
              reason: backlogReason || null,
            }
          : undefined,
      };

      const updated = await PlaythroughApi.updateCompletion(uid, request);
      setPlaythrough(updated);

      // Refresh dependent data (instance completions, DLC links).
      GameInstanceApi.invalidateCache(updated.gameInstanceUid);
      const [inst, dlcList] = await Promise.all([
        GameInstanceApi.get(updated.gameInstanceUid),
        DlcApi.getByGameInstance(updated.gameInstanceUid),
      ]);
      setInstance(inst);
      setDlcs(dlcList ?? []);
      setSuccessMessage('Playthrough updated.');
    } catch {
      setError('Failed to update playthrough.');
    } finally {
      setSubmitting(false);
    }
  }, [
    uid,
    instance,
    mainCompletion,
    mainCompletionStateUid,
    mainInfo,
    mainFinishedDate,
    mainCompletedDate,
    dlcs,
    dlcEdits,
    completionByDlc,
    playthroughTypeUid,
    inputUid,
    startedAt,
    playthroughStateUid,
    backlogRemovedDate,
    backlogReason,
  ]);

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
  const typeName = (u: string | null | undefined) =>
    (u && playthroughTypes.find((t) => t.uid === u)?.name) || u || '—';
  const stateName = (u: string | null | undefined) =>
    (u && playthroughStates.find((s) => s.uid === u)?.name) || u || '—';

  const currentBacklog = instance?.backlogEntries?.find((e) => !e.removedDate) ?? null;
  const panelSx = (theme: import('@mui/material').Theme) => ({
    mt: 2,
    p: 2,
    width: '100%',
    maxWidth: 760,
    borderRadius: 1,
    bgcolor:
      theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
  });

  const setLastBookingButton = (onSet: () => void) => (
    <Button
      size="small"
      variant="outlined"
      onClick={onSet}
      disabled={!lastBookingDate}
      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      Set to last booking
    </Button>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Complete Playthrough</Typography>
        <Button component={Link} to="/play-activity/active" size="small">
          Back to Active
        </Button>
        <Button component={Link} to={`/playthroughs/${uid}`} size="small">
          Old edit view
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Playthrough metadata + last booking */}
      <Paper variant="outlined" sx={panelSx}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Playthrough
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" required>
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Started at"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" required>
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" required>
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
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Last time booking: {lastBookingDate || '—'}
        </Typography>
      </Paper>

      {/* Backlog */}
      <Paper variant="outlined" sx={panelSx}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Backlog
        </Typography>
        <BacklogInfoBlock entries={instance?.backlogEntries ?? []} />
        {currentBacklog && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2} sx={{ maxWidth: 520 }}>
              <TextField
                label="Reason"
                value={backlogReason}
                onChange={(e) => setBacklogReason(e.target.value)}
                size="small"
                fullWidth
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="date"
                  label="Removed date"
                  value={backlogRemovedDate}
                  onChange={(e) => setBacklogRemovedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                {setLastBookingButton(() => setBacklogRemovedDate(lastBookingDate))}
              </Stack>
            </Stack>
          </>
        )}
      </Paper>

      {/* Main game completion */}
      <Paper variant="outlined" sx={panelSx}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Game completion
        </Typography>
        <Box sx={{ mb: 2 }}>
          <CompletionBar
            completionState={
              mainCompletionStateUid
                ? completionStateName(mainCompletionStateUid)
                : 'Backlog'
            }
            playthroughState={stateName(playthroughStateUid)}
          />
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Completion state</InputLabel>
              <Select
                label="Completion state"
                value={mainCompletionStateUid}
                onChange={(e) => setMainCompletionStateUid(e.target.value)}
              >
                {completionStates.map((c) => (
                  <MenuItem key={c.uid} value={c.uid}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Info"
              value={mainInfo}
              onChange={(e) => setMainInfo(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="date"
                label="Finished date"
                value={mainFinishedDate}
                onChange={(e) => setMainFinishedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />
              {setLastBookingButton(() => setMainFinishedDate(lastBookingDate))}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="date"
                label="Completed date"
                value={mainCompletedDate}
                onChange={(e) => setMainCompletedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />
              {setLastBookingButton(() => setMainCompletedDate(lastBookingDate))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* DLCs */}
      <Paper variant="outlined" sx={panelSx}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          DLC
        </Typography>
        {dlcs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No DLCs for this game instance.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {dlcs.map((dlc) => {
              const edit = dlcEdits[dlc.uid];
              if (!edit) return null;
              const linkedToCurrent = dlc.playthroughUid === uid;
              const otherPlaythrough =
                dlc.playthroughUid && dlc.playthroughUid !== uid
                  ? linkedPlaythroughs[dlc.playthroughUid]
                  : null;
              const dlcCompletionState = edit.completionStateUid
                ? completionStateName(edit.completionStateUid)
                : 'Backlog';
              return (
                <Box
                  key={dlc.uid}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          checked={edit.link}
                          disabled={linkedToCurrent}
                          onChange={(e) =>
                            updateDlcEdit(dlc.uid, { link: e.target.checked })
                          }
                        />
                      }
                      label=""
                    />
                    <Box sx={{ flexShrink: 0 }}>
                      <SmartImage
                        imageUid={dlc.coverImageUid ?? null}
                        thumbnail
                        alt=""
                        aspectRatio={2 / 3}
                        fit="cover"
                        sx={{ width: 45, height: 60, borderRadius: 0.5 }}
                        imgSx={{ borderRadius: 0.5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {dlc.name}
                      </Typography>
                      <Box sx={{ my: 0.5 }}>
                        <CompletionBar
                          completionState={dlcCompletionState}
                          playthroughState={null}
                        />
                      </Box>
                      {!linkedToCurrent && otherPlaythrough && (
                        <Typography variant="caption" color="text.secondary">
                          Linked playthrough: {otherPlaythrough.startedAt?.slice(0, 4) ?? '—'} ·{' '}
                          {typeName(otherPlaythrough.playthroughTypeUid)} ·{' '}
                          {stateName(otherPlaythrough.playthroughStateUid)}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {edit.link && (
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Completion state</InputLabel>
                          <Select
                            label="Completion state"
                            value={edit.completionStateUid}
                            onChange={(e) =>
                              updateDlcEdit(dlc.uid, { completionStateUid: e.target.value })
                            }
                          >
                            {completionStates.map((c) => (
                              <MenuItem key={c.uid} value={c.uid}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Info"
                          value={edit.info}
                          onChange={(e) => updateDlcEdit(dlc.uid, { info: e.target.value })}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <TextField
                            type="date"
                            label="Finished date"
                            value={edit.finishedDate}
                            onChange={(e) =>
                              updateDlcEdit(dlc.uid, { finishedDate: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          {setLastBookingButton(() =>
                            updateDlcEdit(dlc.uid, { finishedDate: lastBookingDate })
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <TextField
                            type="date"
                            label="Completed date"
                            value={edit.completedDate}
                            onChange={(e) =>
                              updateDlcEdit(dlc.uid, { completedDate: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          {setLastBookingButton(() =>
                            updateDlcEdit(dlc.uid, { completedDate: lastBookingDate })
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Single submit */}
      <Box sx={{ mt: 3, maxWidth: 760 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Complete Playthrough'}
        </Button>
      </Box>
    </Box>
  );
}
