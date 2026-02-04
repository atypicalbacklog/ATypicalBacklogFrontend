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
import { GameApi } from '../../services/gameApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { BacklogApi } from '../../services/backlogApi';
import { GameCompletionApi } from '../../services/gameCompletionApi';
import { searchGames } from '../../services/gameSearchApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import StepSection from './components/StepSection';
import DateField from './components/DateField';
import BacklogBlock from './components/BacklogBlock';
import SearchSuggestions from './components/SearchSuggestions';
import SelectedItemChip from './components/SelectedItemChip';
import type { GameQueryResultDto } from '../../types/dto';
import type { SearchResultItem } from './components/SearchSuggestions';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddInstanceForm() {
  const { referenceData } = useReferenceData();
  const [selectedGame, setSelectedGame] = useState<GameQueryResultDto | null>(null);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState<SearchResultItem[]>([]);
  const [addNewGame, setAddNewGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGameReleaseDate, setNewGameReleaseDate] = useState(today());
  const [newGameAddToBacklog, setNewGameAddToBacklog] = useState(false);
  const [newGameBacklogAddedDate, setNewGameBacklogAddedDate] = useState(today());
  const [newGameBacklogReason, setNewGameBacklogReason] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [variantUid, setVariantUid] = useState('');
  const [platformUid, setPlatformUid] = useState('');
  const [originalConsoleUid, setOriginalConsoleUid] = useState('');
  const [receivedDate, setReceivedDate] = useState(today());
  const [forFree, setForFree] = useState(false);
  const [inPossession, setInPossession] = useState(true);
  const [completionStateUid, setCompletionStateUid] = useState('');
  const [completionInfo, setCompletionInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const platforms = referenceData?.data.platforms.filter((p) => !p.hideInChoices) ?? [];
  const consoles = referenceData?.data.consoles ?? [];
  const variants = [...(referenceData?.data.variants ?? [])].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
  const completionStates = referenceData?.data.completionStates ?? [];

  const gameResolved = selectedGame != null || (addNewGame && newGameName.trim() && newGameReleaseDate);
  const step2Valid = gameResolved && platformUid && variantUid;
  const step3Valid = step2Valid && receivedDate;

  useEffect(() => {
    if (!gameSearchQuery.trim() || gameSearchQuery.length < 2) {
      setGameSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchGames(gameSearchQuery)
        .then((rows) =>
          setGameSearchResults(
            rows.map((r) => ({
              id: r.gameUid,
              name: r.name,
              thumbnailImageUid: r.thumbnailImageUid,
              subtitle: r.releaseDate ?? undefined,
            }))
          )
        )
        .catch(() => setGameSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [gameSearchQuery]);

  const handleSelectGame = useCallback((item: SearchResultItem) => {
    setSelectedGame({
      gameUid: item.id,
      name: item.name,
      releaseDate: item.subtitle ?? null,
      thumbnailImageUid: item.thumbnailImageUid,
    });
    setGameSearchQuery('');
    setGameSearchResults([]);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      let gameUid: string;
      if (addNewGame) {
        const game = await GameApi.create({
          name: newGameName.trim(),
          firstReleaseDate: newGameReleaseDate,
        });
        gameUid = game.uid;
        if (newGameAddToBacklog) {
          await BacklogApi.add(game.uid, newGameBacklogAddedDate, newGameBacklogReason || '');
        }
      } else {
        gameUid = selectedGame!.gameUid;
      }
      const instance = await GameInstanceApi.create({
        gameUid,
        platformUid,
        variantUid,
        name: instanceName.trim() || null,
        releaseDate: releaseDate || null,
        originalConsoleUid: originalConsoleUid || null,
        receivedDate,
        forFree,
        inPossession,
      });
      if (completionStateUid) {
        await GameCompletionApi.update(
          instance.uid,
          completionStateUid,
          completionInfo || ''
        );
      }
      setSuccessMessage('Instance created.');
      setSelectedGame(null);
      setAddNewGame(false);
      setNewGameName('');
      setNewGameReleaseDate(today());
      setNewGameBacklogReason('');
      setInstanceName('');
      setReleaseDate('');
      setVariantUid('');
      setPlatformUid('');
      setOriginalConsoleUid('');
      setReceivedDate(today());
      setForFree(false);
      setInPossession(true);
      setCompletionStateUid('');
      setCompletionInfo('');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    addNewGame,
    selectedGame,
    newGameName,
    newGameReleaseDate,
    newGameAddToBacklog,
    newGameBacklogAddedDate,
    newGameBacklogReason,
    instanceName,
    releaseDate,
    variantUid,
    platformUid,
    originalConsoleUid,
    receivedDate,
    forFree,
    inPossession,
    completionStateUid,
    completionInfo,
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
          {selectedGame ? (
            <SelectedItemChip
              label={selectedGame.name}
              thumbnailImageUid={selectedGame.thumbnailImageUid}
              onClear={() => setSelectedGame(null)}
            />
          ) : (
            <>
              <TextField
                label="Game"
                value={gameSearchQuery}
                onChange={(e) => setGameSearchQuery(e.target.value)}
                required
                fullWidth
                size="small"
                placeholder="Search for a game"
              />
              <SearchSuggestions
                results={gameSearchResults}
                onSelect={handleSelectGame}
              />
            </>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={addNewGame}
                onChange={(e) => setAddNewGame(e.target.checked)}
              />
            }
            label="Add new Game"
          />
          {addNewGame && (
            <Stack spacing={2} sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
              <TextField
                label="Name"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <DateField
                label="Release date"
                value={newGameReleaseDate}
                onChange={setNewGameReleaseDate}
                required
              />
              <BacklogBlock
                addToBacklog={newGameAddToBacklog}
                onAddToBacklogChange={setNewGameAddToBacklog}
                addedDate={newGameBacklogAddedDate}
                onAddedDateChange={setNewGameBacklogAddedDate}
                reason={newGameBacklogReason}
                onReasonChange={setNewGameBacklogReason}
              />
            </Stack>
          )}
        </Stack>
      </StepSection>

      <StepSection title="Step 2" locked={!gameResolved}>
        <Stack spacing={2}>
          <TextField
            label="Instance name"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            fullWidth
            size="small"
            placeholder={selectedGame?.name ?? 'Game name'}
          />
          <DateField
            label="Release date"
            value={releaseDate}
            onChange={setReleaseDate}
          />
          <TextField
            select
            label="Variant"
            value={variantUid}
            onChange={(e) => setVariantUid(e.target.value)}
            required
            fullWidth
            size="small"
          >
            {variants.map((v) => (
              <MenuItem key={v.uid} value={v.uid}>
                {v.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Platform"
            value={platformUid}
            onChange={(e) => setPlatformUid(e.target.value)}
            required
            fullWidth
            size="small"
          >
            {platforms.map((p) => (
              <MenuItem key={p.uid} value={p.uid}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Original console"
            value={originalConsoleUid}
            onChange={(e) => setOriginalConsoleUid(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">—</MenuItem>
            {consoles.map((c) => (
              <MenuItem key={c.uid} value={c.uid}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </StepSection>

      <StepSection title="Step 3" locked={!step2Valid}>
        <Stack spacing={2}>
          <DateField
            label="Received date"
            value={receivedDate}
            onChange={setReceivedDate}
            required
          />
          <FormControlLabel
            control={<Checkbox checked={forFree} onChange={(e) => setForFree(e.target.checked)} />}
            label="For free"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={inPossession}
                onChange={(e) => setInPossession(e.target.checked)}
              />
            }
            label="In possession"
          />
          <TextField
            select
            label="Completion state"
            value={completionStateUid}
            onChange={(e) => setCompletionStateUid(e.target.value)}
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
            label="Completion info"
            value={completionInfo}
            onChange={(e) => setCompletionInfo(e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
          />
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
