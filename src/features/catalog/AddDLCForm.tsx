import { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { BacklogApi } from '../../services/backlogApi';
import { GameCompletionApi } from '../../services/gameCompletionApi';
import { DlcApi } from '../../services/dlcApi';
import { searchGameInstances } from '../../services/gameInstanceSearchApi';
import { PlaythroughApi } from '../../services/playthroughApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import StepSection from './components/StepSection';
import DateField from './components/DateField';
import SearchSuggestions from './components/SearchSuggestions';
import SelectedItemChip from './components/SelectedItemChip';
import type {
  GameInstanceQueryResultDto,
  GameInstanceDetailDTO,
  PlaythroughQueryResultDto,
} from '../../types/dto';
import type { SearchResultItem } from './components/SearchSuggestions';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddDLCForm() {
  const { referenceData } = useReferenceData();
  const [selectedInstance, setSelectedInstance] =
    useState<GameInstanceQueryResultDto | null>(null);
  const [instanceDetail, setInstanceDetail] = useState<GameInstanceDetailDTO | null>(null);
  const [instanceSearchQuery, setInstanceSearchQuery] = useState('');
  const [instanceSearchResults, setInstanceSearchResults] = useState<SearchResultItem[]>([]);
  const [dlcName, setDlcName] = useState('');
  const [receivedDate, setReceivedDate] = useState(today());
  const [connectToPlaythrough, setConnectToPlaythrough] = useState(false);
  const [playthroughs, setPlaythroughs] = useState<PlaythroughQueryResultDto[]>([]);
  const [selectedPlaythroughUid, setSelectedPlaythroughUid] = useState<string | null>(null);
  const [dlcCompletionStateUid, setDlcCompletionStateUid] = useState('');
  const [dlcCompletionInfo, setDlcCompletionInfo] = useState('');
  const [putBackInBacklog, setPutBackInBacklog] = useState(false);
  const [backlogAddedDate, setBacklogAddedDate] = useState(today());
  const [backlogReason, setBacklogReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const completionStates = referenceData?.data.completionStates ?? [];
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

  useEffect(() => {
    if (!instanceSearchQuery.trim() || instanceSearchQuery.length < 2) {
      setInstanceSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchGameInstances(instanceSearchQuery)
        .then((rows) =>
          setInstanceSearchResults(
            rows.map((r) => ({
              id: r.gameInstanceUid,
              name: r.name || r.gameInstanceUid,
              coverImageUid: r.coverImageUid,
              subtitle: r.platformUid,
            }))
          )
        )
        .catch(() => setInstanceSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [instanceSearchQuery]);

  useEffect(() => {
    if (!selectedInstance) {
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

  const handleSelectInstance = useCallback((item: SearchResultItem) => {
    setSelectedInstance({
      gameInstanceUid: item.id,
      name: item.name,
      platformUid: item.subtitle ?? '',
      coverImageUid: item.coverImageUid,
    });
    setInstanceSearchQuery('');
    setInstanceSearchResults([]);
  }, []);

  const instanceCompletionLabel =
    instanceDetail?.completions?.length
      ? referenceData?.data.completionStates.find(
          (c) => c.uid === instanceDetail.completions[0]?.completionStateUid
        )?.name ?? instanceDetail.completions[0]?.completionStateUid
      : '—';
  const backlog = instanceDetail?.backlogEntries?.find((e) => !e.removedDate) ?? null;

  const handleSubmit = useCallback(async () => {
    if (!selectedInstance?.gameInstanceUid) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const dlc = await DlcApi.create({
        gameInstanceUid: selectedInstance.gameInstanceUid,
        name: dlcName.trim() || selectedInstance.name || 'DLC',
        receivedDate: receivedDate || null,
        playthroughUid: selectedPlaythroughUid ?? null,
      });
      if (dlcCompletionStateUid) {
        await GameCompletionApi.update(
          selectedInstance.gameInstanceUid,
          dlcCompletionStateUid,
          dlcCompletionInfo || '',
          dlc.uid
        );
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
      setConnectToPlaythrough(false);
      setSelectedPlaythroughUid(null);
      setDlcCompletionStateUid('');
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
    selectedPlaythroughUid,
    dlcCompletionStateUid,
    dlcCompletionInfo,
    putBackInBacklog,
    backlogAddedDate,
    backlogReason,
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

      <StepSection title="Step 1">
        <Stack spacing={2}>
          {selectedInstance ? (
            <SelectedItemChip
              label={selectedInstance.name || selectedInstance.gameInstanceUid}
              coverImageUid={selectedInstance.coverImageUid}
              onClear={() => setSelectedInstance(null)}
            />
          ) : (
            <>
              <TextField
                label="Game instance"
                value={instanceSearchQuery}
                onChange={(e) => setInstanceSearchQuery(e.target.value)}
                required
                fullWidth
                size="small"
                placeholder="Search for a game instance"
              />
              <SearchSuggestions
                results={instanceSearchResults}
                onSelect={handleSelectInstance}
              />
            </>
          )}
        </Stack>
      </StepSection>

      <StepSection title="Step 2" locked={!step2Valid}>
        <Stack spacing={2}>
          <TextField
            label="DLC name"
            value={dlcName}
            onChange={(e) => setDlcName(e.target.value)}
            fullWidth
            size="small"
            placeholder={selectedInstance?.name ?? 'Game name'}
          />
          <DateField
            label="Received date"
            value={receivedDate}
            onChange={setReceivedDate}
            required
          />
        </Stack>
      </StepSection>

      <StepSection title="Step 3" locked={!step3Valid}>
        <Stack spacing={2}>
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
            <Stack spacing={1}>
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
            </Stack>
          )}
          <TextField
            label="Game completion (instance)"
            value={instanceCompletionLabel}
            size="small"
            fullWidth
            InputProps={{ readOnly: true }}
          />
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
          <TextField
            label="DLC completion info"
            value={dlcCompletionInfo}
            onChange={(e) => setDlcCompletionInfo(e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
          />
          {backlog ? (
            <Typography variant="body2" color="text.secondary">
              Backlog: since {backlog.addedDate}
              {backlog.removedDate ? ` until ${backlog.removedDate}` : ' (active)'}
            </Typography>
          ) : (
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
        </Stack>
      </StepSection>

      <StepSection title="Step 4" locked={!step3Valid}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !step3Valid}
        >
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </StepSection>
    </Box>
  );
}
