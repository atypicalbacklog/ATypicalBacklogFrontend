import { useEffect, useState, useCallback } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { GameApi } from '../../services/gameApi';
import { BacklogApi } from '../../services/backlogApi';
import { IgdbApi } from '../../services/igdbApi';
import { searchGames } from '../../services/gameSearchApi';
import StepSection from './components/StepSection';
import DateField from './components/DateField';
import BacklogBlock from './components/BacklogBlock';
import SearchSuggestions, { type SearchResultItem } from './components/SearchSuggestions';
import ExternalGameSearch from '../shared/ExternalGameSearch';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddGameForm() {
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState(today());
  const [addToBacklog, setAddToBacklog] = useState(false);
  const [backlogAddedDate, setBacklogAddedDate] = useState(today());
  const [backlogReason, setBacklogReason] = useState('');
  const [similarGames, setSimilarGames] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingCoverImport, setPendingCoverImport] = useState<number | null>(null);
  const [createdGameUid, setCreatedGameUid] = useState<string | null>(null);

  const step1Valid = Boolean(name.trim() && releaseDate);

  useEffect(() => {
    if (!name.trim() || name.length < 2) {
      setSimilarGames([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      searchGames(name)
        .then((rows) =>
          setSimilarGames(
            rows.map((r) => ({
              id: r.gameUid,
              name: r.name,
              coverImageUid: r.coverImageUid,
              subtitle: r.releaseDate ?? undefined,
            }))
          )
        )
        .catch(() => setSimilarGames([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [name]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const game = await GameApi.create({
        name: name.trim(),
        firstReleaseDate: releaseDate,
        coverImageUid: null,
      });
      setCreatedGameUid(game.uid);
      
      if (addToBacklog) {
        await BacklogApi.add(game.uid, backlogAddedDate, backlogReason || '');
      }
      
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
      
      setSuccessMessage(
        addToBacklog ? 'Game and backlog entry created.' : 'Game created.'
      );
      setName('');
      setReleaseDate(today());
      setAddToBacklog(false);
      setBacklogAddedDate(today());
      setBacklogReason('');
      setSimilarGames([]);
      setPendingCoverImport(null);
      setCreatedGameUid(null);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [name, releaseDate, addToBacklog, backlogAddedDate, backlogReason, pendingCoverImport]);


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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '1 1 auto', minWidth: 200, order: 1 }}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <Box sx={{ flexShrink: 0 }}>
                <ExternalGameSearch
                  gameName={name}
                  releaseDate={releaseDate}
                  onOverwriteName={(newName) => setName(newName)}
                  onOverwriteDate={(newDate) => setReleaseDate(newDate)}
                  onMarkCoverImport={(externalId) => {
                    setPendingCoverImport(externalId);
                  }}
                  ownerType="GAME"
                  ownerUid={createdGameUid}
                />
              </Box>
            </Box>
          </Box>
          <DateField
            label="Release date"
            value={releaseDate}
            onChange={setReleaseDate}
            required
          />
          <SearchSuggestions
            results={similarGames}
            onSelect={() => {}}
            emptyMessage={searching ? 'Searching…' : 'Type to find similar games'}
          />
        </Stack>
      </StepSection>

      <StepSection locked={!step1Valid}>
        <BacklogBlock
          addToBacklog={addToBacklog}
          onAddToBacklogChange={setAddToBacklog}
          addedDate={backlogAddedDate}
          onAddedDateChange={setBacklogAddedDate}
          reason={backlogReason}
          onReasonChange={setBacklogReason}
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !step1Valid}
          >
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </StepSection>
    </Box>
  );
}
