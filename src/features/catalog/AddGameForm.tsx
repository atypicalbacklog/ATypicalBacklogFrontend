import { useEffect, useState, useCallback } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { GameApi } from '../../services/gameApi';
import { BacklogApi } from '../../services/backlogApi';
import { searchGames } from '../../services/gameSearchApi';
import StepSection from './components/StepSection';
import DateField from './components/DateField';
import BacklogBlock from './components/BacklogBlock';
import SearchSuggestions, { type SearchResultItem } from './components/SearchSuggestions';

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
              thumbnailImageUid: r.thumbnailImageUid,
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
      });
      if (addToBacklog) {
        await BacklogApi.add(game.uid, backlogAddedDate, backlogReason || '');
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
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [name, releaseDate, addToBacklog, backlogAddedDate, backlogReason]);

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
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="small"
          />
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

      <StepSection title="Step 2" locked={!step1Valid}>
        <BacklogBlock
          addToBacklog={addToBacklog}
          onAddToBacklogChange={setAddToBacklog}
          addedDate={backlogAddedDate}
          onAddedDateChange={setBacklogAddedDate}
          reason={backlogReason}
          onReasonChange={setBacklogReason}
        />
      </StepSection>

      <StepSection title="Step 3" locked={!step1Valid}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !step1Valid}
        >
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </StepSection>
    </Box>
  );
}
