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
import { IgdbApi, type IgdbGameSearchResultDto } from '../../services/igdbApi';
import { searchGames } from '../../services/gameSearchApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import StepSection from './components/StepSection';
import DateField from './components/DateField';
import BacklogBlock from './components/BacklogBlock';
import SearchSuggestions from './components/SearchSuggestions';
import SelectedItemChip from './components/SelectedItemChip';
import PlatformSelect from '../shared/PlatformSelect';
import ExternalGameSearch from '../shared/ExternalGameSearch';
import DirectExternalIdBlock from '../shared/DirectExternalIdBlock';
import type { GameQueryResultDto } from '../../types/dto';
import type { SearchResultItem } from './components/SearchSuggestions';
import { resolveVariantAndOriginalFromExternalGame } from '../admin/stagedGameResolutionUtils';

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
  const [pendingCoverImport, setPendingCoverImport] = useState<number | null>(null);
  const [newGameExternalIgdbId, setNewGameExternalIgdbId] = useState<string | null>(null);
  const [instanceExternalIgdbId, setInstanceExternalIgdbId] = useState<string | null>(null);
  const [createdGameUid, setCreatedGameUid] = useState<string | null>(null);
  const [instanceExternalGame, setInstanceExternalGame] =
    useState<IgdbGameSearchResultDto | null>(null);

  const consoles = referenceData?.data.consoles ?? [];
  const platforms = referenceData?.data.platforms ?? [];
  const variants = [...(referenceData?.data.variants ?? [])].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
  const completionStates = referenceData?.data.completionStates ?? [];

  const gameResolved = selectedGame != null || (addNewGame && newGameName.trim() && newGameReleaseDate);
  const step2Valid = gameResolved && platformUid && variantUid;
  const step3Valid = step2Valid && receivedDate;

  // Sync gameSearchQuery and newGameName
  useEffect(() => {
    if (addNewGame && !newGameName && gameSearchQuery) {
      setNewGameName(gameSearchQuery);
    } else if (!addNewGame && !gameSearchQuery && newGameName) {
      setGameSearchQuery(newGameName);
    }
  }, [addNewGame, gameSearchQuery, newGameName]);

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
              coverImageUid: r.coverImageUid,
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
      coverImageUid: item.coverImageUid,
    });
    setGameSearchQuery('');
    setGameSearchResults([]);
  }, []);

  // When an external game is selected for the instance, try to resolve variant/original
  useEffect(() => {
    if (!instanceExternalGame || !referenceData) return;
    const needVariant = !variantUid;
    const needOriginal = !originalConsoleUid;
    if (!needVariant && !needOriginal) return;
    if (!platformUid && needVariant) return;
    const resolved = resolveVariantAndOriginalFromExternalGame(
      instanceExternalGame,
      platformUid,
      variantUid,
      originalConsoleUid,
      consoles,
      platforms,
      variants
    );
    if (needVariant && resolved.variantUid) {
      setVariantUid(resolved.variantUid);
    }
    if (needOriginal && resolved.originalConsoleUid) {
      setOriginalConsoleUid(resolved.originalConsoleUid);
    }
  }, [
    instanceExternalGame,
    referenceData,
    platformUid,
    variantUid,
    originalConsoleUid,
    consoles,
    platforms,
    variants,
  ]);

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
          coverImageUid: null,
        });
        gameUid = game.uid;
        setCreatedGameUid(game.uid);
        
        // Import cover if marked
        if (pendingCoverImport) {
          try {
            await IgdbApi.importCover({
              externalId: pendingCoverImport,
              ownerType: 'GAME',
              gameUid: game.uid,
            });
          } catch {
            // Error handling can be added
          }
        }
        if (newGameAddToBacklog) {
          await BacklogApi.add(game.uid, newGameBacklogAddedDate, newGameBacklogReason || '');
        }
      } else {
        gameUid = selectedGame!.gameUid;
      }
      const instanceExternalId =
        instanceExternalIgdbId ?? (addNewGame ? newGameExternalIgdbId : null);
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
        externalIgdbId: instanceExternalId || undefined,
      });
      
      // Import cover if marked (for instance)
      if (pendingCoverImport) {
        try {
          await IgdbApi.importCover({
            externalId: pendingCoverImport,
            ownerType: 'GAME_INSTANCE',
            gameInstanceUid: instance.uid,
          });
        } catch {
          // Error handling can be added
        }
      }
      
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
      setPendingCoverImport(null);
      setNewGameExternalIgdbId(null);
      setInstanceExternalIgdbId(null);
      setCreatedGameUid(null);
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
    pendingCoverImport,
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
          <FormControlLabel
            control={
              <Checkbox
                checked={addNewGame}
                onChange={(e) => {
                  setAddNewGame(e.target.checked);
                  if (e.target.checked) {
                    setSelectedGame(null);
                  }
                }}
              />
            }
            label="Add new Game"
          />
          {selectedGame && !addNewGame && (
            <SelectedItemChip
              label={selectedGame.name}
              coverImageUid={selectedGame.coverImageUid}
              onClear={() => setSelectedGame(null)}
            />
          )}
          {!selectedGame && !addNewGame && (
            <>
              <TextField
                label="Game"
                value={gameSearchQuery}
                onChange={(e) => {
                  setGameSearchQuery(e.target.value);
                  if (addNewGame) {
                    setNewGameName(e.target.value);
                  }
                }}
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
          {addNewGame && (
            <Stack spacing={2} sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '1 1 auto', minWidth: 200 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                label="Name"
                value={newGameName}
                onChange={(e) => {
                  setNewGameName(e.target.value);
                  if (!addNewGame) {
                    setGameSearchQuery(e.target.value);
                  }
                }}
                      required
                      fullWidth
                      size="small"
                      sx={{ flex: '1 1 200px' }}
                    />
                    <Box sx={{ flexShrink: 0 }}>
                      <ExternalGameSearch
                        gameName={newGameName}
                        releaseDate={newGameReleaseDate}
                        onOverwriteName={(newName) => {
                          setNewGameName(newName);
                          setInstanceName((prev) => prev || newName);
                        }}
                        onOverwriteDate={(newDate) => {
                          setNewGameReleaseDate(newDate);
                          setReleaseDate((prev) => prev || newDate);
                        }}
                        onMarkCoverImport={(externalId) => {
                          setPendingCoverImport(externalId);
                        }}
                        onSetExternalId={(id) => setNewGameExternalIgdbId(id)}
                        ownerType="GAME"
                        ownerUid={createdGameUid}
                      />
                    </Box>
                    {newGameExternalIgdbId && (
                      <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        IGDB ID: {newGameExternalIgdbId}
                      </Typography>
                    )}
                    <DirectExternalIdBlock
                      onConfirm={(res, actions) => {
                        if (actions.name) setNewGameName(res.name);
                        if (actions.date && res.releaseDate) setNewGameReleaseDate(res.releaseDate);
                        if (actions.image) setPendingCoverImport(res.externalId);
                        setNewGameExternalIgdbId(String(res.externalId));
                      }}
                    />
                  </Box>
                </Box>
              </Box>
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

      <StepSection locked={!gameResolved}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '1 1 auto', minWidth: 200 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Instance name"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder={selectedGame?.name ?? 'Game name'}
                  sx={{ flex: '1 1 200px' }}
                />
                <Box sx={{ flexShrink: 0 }}>
                  <ExternalGameSearch
                    gameName={instanceName || ''}
                    releaseDate={releaseDate || ''}
                    onOverwriteName={(newName) => setInstanceName(newName)}
                    onOverwriteDate={(newDate) => setReleaseDate(newDate)}
                    onMarkCoverImport={(externalId) => {
                      setPendingCoverImport(externalId);
                    }}
                    onSetExternalId={(id) => setInstanceExternalIgdbId(id)}
                    ownerType="GAME_INSTANCE"
                    ownerUid={null}
                    onSelectedResultChange={setInstanceExternalGame}
                  />
                </Box>
                {instanceExternalIgdbId && (
                  <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    IGDB ID: {instanceExternalIgdbId}
                  </Typography>
                )}
                <DirectExternalIdBlock
                  onConfirm={(res, actions) => {
                    if (actions.name) setInstanceName(res.name);
                    if (actions.date && res.releaseDate) setReleaseDate(res.releaseDate);
                    if (actions.image) setPendingCoverImport(res.externalId);
                    setInstanceExternalIgdbId(String(res.externalId));
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap">
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
              sx={{ minWidth: 160, flex: 1 }}
            >
              {variants.map((v) => (
                <MenuItem key={v.uid} value={v.uid}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <PlatformSelect
            value={platformUid}
            onChange={(v) => {
              if (v === undefined || v === null) return;
              setPlatformUid(typeof v === 'string' ? v : (Array.isArray(v) && v[0]) || '');
            }}
            required
            size="small"
          />
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

      <StepSection locked={!step2Valid}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <DateField
              label="Received date"
              value={receivedDate}
              onChange={setReceivedDate}
              required
            />
            <Box sx={{ flex: 1 }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={forFree}
                  onChange={(e) => setForFree(e.target.checked)}
                />
              }
              label="For free"
            />
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              select
              label="Completion state"
              value={completionStateUid}
              onChange={(e) => setCompletionStateUid(e.target.value)}
              fullWidth
              size="small"
              sx={{ minWidth: 180, flex: 1 }}
            >
              <MenuItem value="">—</MenuItem>
              {completionStates.map((c) => (
                <MenuItem key={c.uid} value={c.uid}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={inPossession}
                  onChange={(e) => setInPossession(e.target.checked)}
                />
              }
              label="In possession"
            />
          </Stack>
          <TextField
            label="Completion info"
            value={completionInfo}
            onChange={(e) => setCompletionInfo(e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
          />
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
