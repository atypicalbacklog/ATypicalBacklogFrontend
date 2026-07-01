import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getImageUrl } from '../../services/imageApi';
import { searchGameOverviewForPlaythrough } from '../../services/gameOverviewApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { BacklogApi } from '../../services/backlogApi';
import { DlcApi } from '../../services/dlcApi';
import { PlaythroughApi } from '../../services/playthroughApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import StepSection from '../shared/StepSection';
import DateField from '../shared/DateField';
import SelectedItemChip from '../shared/SelectedItemChip';
import CompletionBar from '../shared/CompletionBar';
import ExternalDlcSearch from '../shared/ExternalDlcSearch';
import ExternalGameSearch from '../shared/ExternalGameSearch';
import DirectExternalIdBlock from '../shared/DirectExternalIdBlock';
import { IgdbApi } from '../../services/igdbApi';
import type { GameInstanceDetailDTO, PlaythroughQueryResultDto } from '../../types/dto';
import type { GameOverviewRowDto } from '../library/types';

/** Instance rows only (no DLC), for selection. */
function instanceRows(rows: GameOverviewRowDto[]): GameOverviewRowDto[] {
  return rows.filter((r) => r.gameInstanceUid != null && !r.isDlc);
}

function displayName(r: GameOverviewRowDto) {
  return r.instanceName ?? r.gameName;
}

function displayImageUid(r: GameOverviewRowDto) {
  return r.instanceCoverImageUid ?? r.coverImageUid;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function AddDLCForm() {
  const { referenceData } = useReferenceData();
  const [selectedInstance, setSelectedInstance] = useState<GameOverviewRowDto | null>(null);
  const [instanceDetail, setInstanceDetail] = useState<GameInstanceDetailDTO | null>(null);
  const [instanceSearchQuery, setInstanceSearchQuery] = useState('');
  const [instanceSearchResults, setInstanceSearchResults] = useState<GameOverviewRowDto[]>([]);
  const [instanceSearching, setInstanceSearching] = useState(false);
  const [dlcName, setDlcName] = useState('');
  const [receivedDate, setReceivedDate] = useState(today());
  const [releaseDate, setReleaseDate] = useState(today());
  const [connectToPlaythrough, setConnectToPlaythrough] = useState(false);
  const [playthroughs, setPlaythroughs] = useState<PlaythroughQueryResultDto[]>([]);
  const [selectedPlaythroughUid, setSelectedPlaythroughUid] = useState<string | null>(null);
  const [dlcCompletionStateUid, setDlcCompletionStateUid] = useState('');
  const [dlcCompletionDateValue, setDlcCompletionDateValue] = useState(today());
  const [dlcCompletionInfo, setDlcCompletionInfo] = useState('');
  const [putBackInBacklog, setPutBackInBacklog] = useState(false);
  const [backlogAddedDate, setBacklogAddedDate] = useState(today());
  const [backlogReason, setBacklogReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingDlcCoverImport, setPendingDlcCoverImport] = useState<number | null>(null);
  const [savingInstanceIgdb, setSavingInstanceIgdb] = useState(false);
  const pendingInstanceIgdbUpdateRef = useRef<{
    name?: string;
    releaseDate?: string;
    coverExternalId?: number;
  }>({});

  const completionStates = referenceData?.data.completionStates ?? [];
  const selectedDlcCompletionStateName = dlcCompletionStateUid
    ? completionStates.find((c) => c.uid === dlcCompletionStateUid)?.name ?? ''
    : '';
  const dlcStateNormalized = selectedDlcCompletionStateName.trim().toLowerCase();
  const isDlcCompletedState = dlcStateNormalized === 'completed';
  const isDlcFinishedState = dlcStateNormalized === 'finished' || dlcStateNormalized === 'finished+';
  const showDlcCompletionDateField = isDlcCompletedState || isDlcFinishedState;
  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data.playthroughStates ?? [];
  const playthroughTypeName = (uid: string) =>
    playthroughTypes.find((t) => t.uid === uid)?.name ?? uid;
  const playthroughStateName = (uid: string) =>
    playthroughStates.find((s) => s.uid === uid)?.name ?? uid;
  const playthroughLabel = (p: PlaythroughQueryResultDto) =>
    `${playthroughTypeName(p.playthroughTypeUid)} - ${playthroughStateName(p.playthroughStateUid)} - ${p.startedAt}`;
  const step2Valid = selectedInstance != null;
  const step3Valid = step2Valid;

  const instanceList = instanceRows(instanceSearchResults);

  useEffect(() => {
    if (!instanceSearchQuery.trim() || instanceSearchQuery.length < 2) {
      setInstanceSearchResults([]);
      return;
    }
    setInstanceSearching(true);
    const t = setTimeout(() => {
      searchGameOverviewForPlaythrough(instanceSearchQuery)
        .then(setInstanceSearchResults)
        .catch(() => setInstanceSearchResults([]))
        .finally(() => setInstanceSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [instanceSearchQuery]);

  useEffect(() => {
    if (!selectedInstance?.gameInstanceUid) {
      setInstanceDetail(null);
      setPlaythroughs([]);
      setSelectedPlaythroughUid(null);
      return;
    }
    GameInstanceApi.get(selectedInstance.gameInstanceUid)
      .then(setInstanceDetail)
      .catch(() => setInstanceDetail(null));
    PlaythroughApi.findByGameInstance(selectedInstance.gameInstanceUid)
      .then((list) =>
        setPlaythroughs(list.sort((a, b) => b.startedAt.localeCompare(a.startedAt)))
      )
      .catch(() => setPlaythroughs([]));
  }, [selectedInstance?.gameInstanceUid]);

  const handleSelectInstance = useCallback((row: GameOverviewRowDto) => {
    if (!row.gameInstanceUid) return;
    setSelectedInstance(row);
    setInstanceSearchQuery('');
    setInstanceSearchResults([]);
    pendingInstanceIgdbUpdateRef.current = {};
  }, []);

  const applyInstanceExternalIgdb = useCallback(
    async (
      externalId: string,
      options?: { name?: string; releaseDate?: string; coverExternalId?: number }
    ) => {
      if (!selectedInstance?.gameInstanceUid) return;
      setSavingInstanceIgdb(true);
      setError(null);
      try {
        await GameInstanceApi.update(selectedInstance.gameInstanceUid, {
          externalIgdbId: externalId,
          ...(options?.name != null ? { name: options.name } : {}),
          ...(options?.releaseDate != null ? { releaseDate: options.releaseDate } : {}),
        });
        if (options?.coverExternalId != null) {
          await IgdbApi.importCover({
            externalId: options.coverExternalId,
            ownerType: 'GAME_INSTANCE',
            gameInstanceUid: selectedInstance.gameInstanceUid,
          });
        }
        const updated = await GameInstanceApi.get(selectedInstance.gameInstanceUid);
        setInstanceDetail(updated);
      } catch (e) {
        setError((e as Error).message || 'Failed to set instance IGDB ID.');
      } finally {
        setSavingInstanceIgdb(false);
      }
    },
    [selectedInstance?.gameInstanceUid]
  );

  const instanceMainCompletion = instanceDetail?.completions?.find((c) => !c.dlcUid);
  const instanceExternalIgdbId = instanceDetail?.externalIgdbId?.trim() || null;
  const instanceSearchName =
    instanceDetail?.name ?? (selectedInstance ? displayName(selectedInstance) : '');
  const instanceSearchReleaseDate = instanceDetail?.releaseDate ?? '';
  const instanceCompletionStateName = instanceMainCompletion
    ? (referenceData?.data.completionStates.find(
        (c) => c.uid === instanceMainCompletion.completionStateUid
      )?.name ?? instanceMainCompletion.completionStateUid)
    : 'Backlog';
  const instancePlaythroughState =
    selectedPlaythroughUid && playthroughs.length > 0
      ? (playthroughStates.find(
          (s) => s.uid === playthroughs.find((p) => p.playthroughUid === selectedPlaythroughUid)?.playthroughStateUid
        )?.name ?? null)
      : null;
  const backlog = instanceDetail?.backlogEntries?.find((e) => !e.removedDate) ?? null;

  const handleSubmit = useCallback(async () => {
    if (!selectedInstance?.gameInstanceUid) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const dlcDates =
        showDlcCompletionDateField && dlcCompletionDateValue
          ? isDlcCompletedState
            ? { completedDate: dlcCompletionDateValue }
            : { finishedDate: dlcCompletionDateValue }
          : {};
      const created = await DlcApi.create({
        gameInstanceUid: selectedInstance.gameInstanceUid,
        name: dlcName.trim() || (selectedInstance ? displayName(selectedInstance) : '') || 'DLC',
        receivedDate: receivedDate || null,
        releaseDate: releaseDate || today(),
        playthroughUid: selectedPlaythroughUid ?? null,
        completionStateUid: dlcCompletionStateUid || null,
        info: dlcCompletionInfo || null,
        ...dlcDates,
      });
      if (pendingDlcCoverImport != null) {
        try {
          await IgdbApi.importCover({
            externalId: pendingDlcCoverImport,
            ownerType: 'DLC',
            dlcUid: created.uid,
            gameInstanceUid: selectedInstance.gameInstanceUid,
          });
        } catch {
          // Error handling can be added
        }
        setPendingDlcCoverImport(null);
      }
      const gameUidForBacklog = instanceDetail?.gameUid;
      if (putBackInBacklog && gameUidForBacklog) {
        await BacklogApi.add(gameUidForBacklog, backlogAddedDate, backlogReason || '');
      }
      setSuccessMessage('DLC created.');
      setSelectedInstance(null);
      setInstanceDetail(null);
      setDlcName('');
      setReceivedDate(today());
      setReleaseDate(today());
      setConnectToPlaythrough(false);
      setSelectedPlaythroughUid(null);
      setDlcCompletionStateUid('');
      setDlcCompletionDateValue(today());
      setDlcCompletionInfo('');
      setPutBackInBacklog(false);
      setBacklogAddedDate(today());
      setBacklogReason('');
    } catch (e) {
      setError((e as Error).message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedInstance,
    instanceDetail?.gameUid,
    dlcName,
    receivedDate,
    releaseDate,
    selectedPlaythroughUid,
    dlcCompletionStateUid,
    dlcCompletionDateValue,
    dlcCompletionInfo,
    showDlcCompletionDateField,
    isDlcCompletedState,
    putBackInBacklog,
    backlogAddedDate,
    backlogReason,
    pendingDlcCoverImport,
  ]);

  return (
    <Box sx={{ maxWidth: 480 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      <StepSection>
        <Stack spacing={2}>
          <TextField
            label="Search game"
            value={instanceSearchQuery}
            onChange={(e) => setInstanceSearchQuery(e.target.value)}
            fullWidth
            size="small"
            placeholder="Type to search"
          />
          {selectedInstance ? (
            <SelectedItemChip
              label={(displayName(selectedInstance) || selectedInstance.gameInstanceUid) ?? ''}
              coverImageUid={displayImageUid(selectedInstance)}
              onClear={() => setSelectedInstance(null)}
            />
          ) : (
            <>
              {instanceSearching && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Searching…
                  </Typography>
                </Stack>
              )}
              {!instanceSearching && instanceList.length > 0 && (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    maxHeight: 240,
                    overflow: 'auto',
                  }}
                >
                  <List dense disablePadding>
                    {instanceList.map((r) => (
                      <ListItemButton
                        key={r.gameInstanceUid!}
                        onClick={() => handleSelectInstance(r)}
                      >
                        {getImageUrl(displayImageUid(r), true) ? (
                          <Box
                            component="img"
                            src={getImageUrl(displayImageUid(r), true)!}
                            alt=""
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 0.5,
                              mr: 1.5,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: 'grey.300',
                              borderRadius: 0.5,
                              mr: 1.5,
                            }}
                          />
                        )}
                        <ListItemText
                          primary={displayName(r)}
                          secondary={
                            [r.platformName ?? r.platformUid, r.variantName ?? r.variantUid]
                              .filter(Boolean)
                              .join(' · ') || undefined
                          }
                          primaryTypographyProps={{ noWrap: true }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              )}
              {!instanceSearching && instanceSearchQuery.length >= 2 && instanceList.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No game instances found.
                </Typography>
              )}
            </>
          )}
        </Stack>
      </StepSection>

      <StepSection locked={!step2Valid}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              label="DLC name"
              value={dlcName}
              onChange={(e) => setDlcName(e.target.value)}
              fullWidth
              size="small"
              placeholder={selectedInstance ? displayName(selectedInstance) : 'Game name'}
            />
            {selectedInstance && instanceDetail && !instanceExternalIgdbId && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  This game instance has no IGDB ID. Set one to search for related DLCs.
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <ExternalGameSearch
                    gameName={instanceSearchName}
                    releaseDate={instanceSearchReleaseDate}
                    onOverwriteName={(name) => {
                      pendingInstanceIgdbUpdateRef.current.name = name;
                    }}
                    onOverwriteDate={(date) => {
                      pendingInstanceIgdbUpdateRef.current.releaseDate = date;
                    }}
                    onMarkCoverImport={(externalId) => {
                      pendingInstanceIgdbUpdateRef.current.coverExternalId = externalId;
                    }}
                    onSetExternalId={(id) => {
                      const pending = pendingInstanceIgdbUpdateRef.current;
                      pendingInstanceIgdbUpdateRef.current = {};
                      void applyInstanceExternalIgdb(id, {
                        name: pending.name,
                        releaseDate: pending.releaseDate,
                        coverExternalId: pending.coverExternalId,
                      });
                    }}
                    ownerType="GAME_INSTANCE"
                    ownerUid={selectedInstance.gameInstanceUid}
                  />
                  <DirectExternalIdBlock
                    onConfirm={(res, actions) => {
                      void applyInstanceExternalIgdb(String(res.externalId), {
                        name: actions.name ? res.name : undefined,
                        releaseDate: actions.date && res.releaseDate ? res.releaseDate : undefined,
                        coverExternalId: actions.image ? res.externalId : undefined,
                      });
                    }}
                  />
                  {savingInstanceIgdb && <CircularProgress size={20} />}
                </Stack>
              </Box>
            )}
            {instanceExternalIgdbId && (
              <Typography variant="body2" color="text.secondary">
                Instance IGDB ID: {instanceExternalIgdbId}
              </Typography>
            )}
            <ExternalDlcSearch
              gameInstanceExternalIgdbId={instanceExternalIgdbId}
              gameInstanceUid={selectedInstance?.gameInstanceUid ?? null}
              dlcName={dlcName}
              releaseDate={releaseDate}
              onOverwriteName={setDlcName}
              onOverwriteDate={setReleaseDate}
              onMarkCoverImport={(externalId) => setPendingDlcCoverImport(externalId)}
            />
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <DateField
              label="Release date"
              value={releaseDate}
              onChange={setReleaseDate}
              required
            />
            <DateField
              label="Received date"
              value={receivedDate}
              onChange={setReceivedDate}
            />
          </Stack>
        </Stack>
      </StepSection>

      <StepSection locked={!step3Valid}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={connectToPlaythrough}
                  onChange={(e) => setConnectToPlaythrough(e.target.checked)}
                />
              }
              label="Connect to Playthrough"
            />
            {connectToPlaythrough && playthroughs.length > 0 && (
              <>
                {selectedPlaythroughUid ? (
                  <SelectedItemChip
                    label={
                      (() => {
                        const p = playthroughs.find(
                          (x) => x.playthroughUid === selectedPlaythroughUid
                        );
                        return p ? playthroughLabel(p) : selectedPlaythroughUid;
                      })()
                    }
                    coverImageUid={null}
                    onClear={() => setSelectedPlaythroughUid(null)}
                  />
                ) : (
                  <TextField
                    select
                    label="Playthrough"
                    value={selectedPlaythroughUid ?? ''}
                    onChange={(e) =>
                      setSelectedPlaythroughUid(e.target.value || null)
                    }
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">—</MenuItem>
                    {playthroughs.map((p) => (
                      <MenuItem key={p.playthroughUid} value={p.playthroughUid}>
                        {playthroughLabel(p)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="flex-start">
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Game completion (instance)
              </Typography>
              <CompletionBar
                completionState={instanceCompletionStateName}
                playthroughState={instancePlaythroughState}
              />
            </Box>
            {backlog && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  Backlog: since {backlog.addedDate}
                  {backlog.removedDate ? ` until ${backlog.removedDate}` : ' (active)'}
                </Typography>
              </Box>
            )}
          </Stack>
          <TextField
            select
            label="DLC completion state"
            value={dlcCompletionStateUid}
            onChange={(e) => setDlcCompletionStateUid(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">—</MenuItem>
            {completionStates.map((c) => (
              <MenuItem key={c.uid} value={c.uid}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          {showDlcCompletionDateField && (
            <DateField
              label={isDlcCompletedState ? 'Completed date' : 'Finished date'}
              value={dlcCompletionDateValue}
              onChange={setDlcCompletionDateValue}
            />
          )}
          <TextField
            label="DLC completion info"
            value={dlcCompletionInfo}
            onChange={(e) => setDlcCompletionInfo(e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
          />
          {!backlog && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={putBackInBacklog}
                    onChange={(e) => setPutBackInBacklog(e.target.checked)}
                  />
                }
                label="Put game back in Backlog"
              />
              {putBackInBacklog && (
                <Stack spacing={2} sx={{ pl: 2 }}>
                  <DateField
                    label="Added date"
                    value={backlogAddedDate}
                    onChange={setBacklogAddedDate}
                    required
                  />
                  <TextField
                    label="Reason (optional)"
                    value={backlogReason}
                    onChange={(e) => setBacklogReason(e.target.value)}
                    multiline
                    minRows={2}
                    size="small"
                    fullWidth
                  />
                </Stack>
              )}
            </Stack>
          )}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || !step3Valid}
            >
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </Stack>
      </StepSection>
    </Box>
  );
}
