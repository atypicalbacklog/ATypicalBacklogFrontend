import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { GameApi } from '../../services/gameApi';
import { searchGames } from '../../services/gameSearchApi';
import { BacklogApi } from '../../services/backlogApi';
import { GameCompletionApi } from '../../services/gameCompletionApi';
import { DlcApi, type DlcDto } from '../../services/dlcApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { GameInstanceDetailDTO, UpdateGameInstanceRequest } from '../../types/dto';
import { GameDTO } from '../../types/dto';
import GameInstanceForm from './GameInstanceForm';
import GameForm from '../games/GameForm';
import CompletionBar from '../shared/CompletionBar';
import SearchSuggestions, { type SearchResultItem } from '../catalog/components/SearchSuggestions';

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
  // Relink to other game
  const [relinkQuery, setRelinkQuery] = useState('');
  const [relinkResults, setRelinkResults] = useState<SearchResultItem[]>([]);
  const [relinkTarget, setRelinkTarget] = useState<SearchResultItem | null>(null);
  const [relinkSubmitting, setRelinkSubmitting] = useState(false);
  // Completion form
  const [completionStateUid, setCompletionStateUid] = useState('');
  const [completionInfo, setCompletionInfo] = useState('');
  const [completionSubmitting, setCompletionSubmitting] = useState(false);
  // DLCs for this instance (edit section)
  const [dlcs, setDlcs] = useState<DlcDto[]>([]);
  const [dlcUpdatingUid, setDlcUpdatingUid] = useState<string | null>(null);
  const [dlcEdits, setDlcEdits] = useState<Record<string, { name: string; receivedDate: string; releaseDate: string; completionStateUid: string }>>({});
  const [dlcExpanded, setDlcExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!uid) return;
    GameInstanceApi.get(uid)
      .then((inst) => {
        setInstance(inst);
        if (inst.gameUid) {
          GameApi.get(inst.gameUid).then(setGame).catch(() => {});
        }
        const currentBacklog = inst.backlogEntries?.find((e) => !e.removedDate);
        if (currentBacklog) setReasonEdit(currentBacklog.reason);
        DlcApi.getByGameInstance(uid)
          .then((list) => setDlcs(Array.isArray(list) ? list : []))
          .catch(() => {});
      })
      .catch(() => setError('Failed to load game instance'))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleUpdateInstance = (data: UpdateGameInstanceRequest) => {
    if (!uid) return;
    return GameInstanceApi.update(uid, data).then(() =>
      GameInstanceApi.get(uid).then(setInstance)
    );
  };

  const refetchInstance = useCallback(() => {
    if (!uid) return;
    GameInstanceApi.get(uid).then((inst) => {
      setInstance(inst);
      if (inst.gameUid) {
        GameApi.get(inst.gameUid).then(setGame).catch(() => {});
      } else {
        setGame(null);
      }
      const current = inst.backlogEntries?.find((e) => !e.removedDate);
      if (current) setReasonEdit(current.reason);
    }).catch(() => {});
  }, [uid]);

  const handleUpdateGame = useCallback(
    async (data: Omit<GameDTO, 'uid'>) => {
      if (!game?.uid) return;
      setError(null);
      try {
        const updated = await GameApi.update(game.uid, data);
        setGame(updated);
      } catch {
        setError('Failed to update game.');
      }
    },
    [game?.uid]
  );


  const backlogEntries = instance?.backlogEntries ?? [];
  const backlog = backlogEntries.find((e) => !e.removedDate) ?? null;
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

  // Game search for relink
  useEffect(() => {
    if (!relinkQuery.trim() || relinkQuery.length < 2) {
      setRelinkResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchGames(relinkQuery)
        .then((rows) =>
          setRelinkResults(
            rows.map((r) => ({
              id: r.gameUid,
              name: r.name,
              coverImageUid: r.coverImageUid,
              subtitle: r.releaseDate ?? undefined,
            }))
          )
        )
        .catch(() => setRelinkResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [relinkQuery]);

  const handleSelectRelinkGame = useCallback((item: SearchResultItem) => {
    setRelinkTarget(item);
    setRelinkQuery('');
    setRelinkResults([]);
  }, []);

  const handleRelink = async () => {
    if (!uid || !relinkTarget) return;
    setRelinkSubmitting(true);
    setError(null);
    try {
      await GameInstanceApi.update(uid, { gameUid: relinkTarget.id });
      setRelinkTarget(null);
      refetchInstance();
    } catch {
      setError('Failed to relink instance to game.');
    } finally {
      setRelinkSubmitting(false);
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

  const refetchDlcs = useCallback(() => {
    if (!uid) return;
    DlcApi.getByGameInstance(uid)
      .then((list) => setDlcs(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, [uid]);

  const handleDlcFieldChange = useCallback(
    (dlcUid: string, field: 'name' | 'receivedDate' | 'releaseDate' | 'completionStateUid', value: string) => {
      setDlcEdits((prev) => ({
        ...prev,
        [dlcUid]: {
          ...prev[dlcUid],
          [field]: value,
        },
      }));
    },
    []
  );

  const getDlcEdit = useCallback(
    (dlc: DlcDto) => ({
      name: dlcEdits[dlc.uid]?.name ?? dlc.name ?? '',
      receivedDate: dlcEdits[dlc.uid]?.receivedDate ?? dlc.receivedDate ?? '',
      releaseDate: dlcEdits[dlc.uid]?.releaseDate ?? dlc.releaseDate ?? '',
      completionStateUid: dlcEdits[dlc.uid]?.completionStateUid ?? dlc.completionStateUid ?? '',
    }),
    [dlcEdits]
  );

  const handleDlcSave = useCallback(
    async (dlc: DlcDto) => {
      const edit = getDlcEdit(dlc);
      setDlcUpdatingUid(dlc.uid);
      setError(null);
      try {
        await DlcApi.update(dlc.uid, {
          name: edit.name,
          receivedDate: edit.receivedDate || null,
          releaseDate: edit.releaseDate || null,
          completionStateUid: edit.completionStateUid || null,
        });
        refetchDlcs();
        setDlcEdits((prev) => {
          const next = { ...prev };
          delete next[dlc.uid];
          return next;
        });
      } catch {
        setError('Failed to save DLC.');
      } finally {
        setDlcUpdatingUid(null);
      }
    },
    [getDlcEdit, refetchDlcs]
  );

  if (!isLoaded) return null;
  if (loading) return <CircularProgress />;
  if (error && !instance)
    return <Typography color="error">{error}</Typography>;
  if (!instance)
    return <Typography color="error">Game instance not found</Typography>;

  const completionStates = referenceData?.data.completionStates ?? [];
  const completionStateName = (u: string) =>
    completionStates.find((c) => c.uid === u)?.name ?? u;
  const mainCompletion = instance.completions.find((c) => !c.dlcUid);
  const instanceCompletionState = mainCompletion
    ? completionStateName(mainCompletion.completionStateUid)
    : 'Backlog';

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

      {/* Game + Backlog: 2 columns */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3}>
          {game && (
            <Grid item xs={12} md={6}>
              <GameForm
                initial={game}
                onSubmit={handleUpdateGame}
                submitLabel="Save"
              />
            </Grid>
          )}
          <Grid item xs={12} md={game ? 6 : 12}>
            {!gameUid ? (
              <Typography variant="body2" color="text.secondary">
                Link this instance to a game first to manage backlog.
              </Typography>
            ) : backlog ? (
              <Stack spacing={2}>
                <Typography variant="body2">
                  Added: {backlog.addedDate}
                  {backlog.removedDate != null &&
                    ` · Removed: ${backlog.removedDate}`}
                </Typography>
                <Box display="flex" gap={2} alignItems="flex-start" flexWrap="wrap">
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
              <Stack spacing={2}>
                <TextField
                  type="date"
                  label="Added date"
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Reason"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  size="small"
                  fullWidth
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
            <Stack spacing={2} sx={{ mt: 3 }}>
              <TextField
                label="Search game"
                placeholder="Move to different game — type to search..."
                value={relinkQuery}
                onChange={(e) => setRelinkQuery(e.target.value)}
                size="small"
                fullWidth
              />
              <SearchSuggestions
                results={relinkResults}
                onSelect={handleSelectRelinkGame}
                emptyMessage="No games found"
              />
              {relinkTarget && (
                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                  <Typography variant="body2">
                    Link this instance to: <strong>{relinkTarget.name}</strong>
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleRelink}
                    disabled={relinkSubmitting}
                  >
                    Relink
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setRelinkTarget(null)}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* GameInstance metadata */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <GameInstanceForm
          mode="update"
          initial={instance}
          onSubmit={handleUpdateInstance}
          submitLabel="Save"
        />
      </Paper>

      {/* Game completion */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <CompletionBar
            completionState={instanceCompletionState}
            playthroughState={null}
          />
          {mainCompletion?.info && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {mainCompletion.info}
            </Typography>
          )}
        </Box>
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
      </Paper>

      {/* DLC */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {dlcs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No DLC for this game instance.
          </Typography>
        ) : (
          <Stack spacing={0}>
            {dlcs.map((dlc) => {
              const edit = getDlcEdit(dlc);
              const updating = dlcUpdatingUid === dlc.uid;
              const expanded = dlcExpanded[dlc.uid] ?? false;
              const completionState = dlc.completionStateUid
                ? completionStateName(dlc.completionStateUid)
                : 'Backlog';
              const label = edit.name || dlc.name || 'DLC';
              return (
                <Box
                  key={dlc.uid}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {label}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDlcExpanded((prev) => ({
                          ...prev,
                          [dlc.uid]: !prev[dlc.uid],
                        }))
                      }
                      aria-expanded={expanded}
                    >
                      {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expanded}>
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
                      <TextField
                        label="Name"
                        value={edit.name}
                        onChange={(e) => handleDlcFieldChange(dlc.uid, 'name', e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <TextField
                          type="date"
                          label="Release date"
                          value={edit.releaseDate}
                          onChange={(e) => handleDlcFieldChange(dlc.uid, 'releaseDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          sx={{ minWidth: 140 }}
                        />
                        <TextField
                          type="date"
                          label="Received date"
                          value={edit.receivedDate}
                          onChange={(e) => handleDlcFieldChange(dlc.uid, 'receivedDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          sx={{ minWidth: 140 }}
                        />
                      </Stack>
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Completion
                        </Typography>
                        <CompletionBar
                          completionState={completionState}
                          playthroughState={null}
                        />
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Completion state</InputLabel>
                          <Select
                            label="Completion state"
                            value={edit.completionStateUid}
                            onChange={(e) =>
                              handleDlcFieldChange(dlc.uid, 'completionStateUid', e.target.value)
                            }
                            disabled={updating}
                          >
                            <MenuItem value="">—</MenuItem>
                            {completionStates.map((c) => (
                              <MenuItem key={c.uid} value={c.uid}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDlcSave(dlc)}
                          disabled={updating}
                        >
                          {updating ? 'Saving…' : 'Save DLC'}
                        </Button>
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
