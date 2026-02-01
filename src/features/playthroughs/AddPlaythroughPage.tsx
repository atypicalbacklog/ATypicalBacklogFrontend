import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { searchGameOverview } from '../../services/gameOverviewApi';
import { PlaythroughApi } from '../../services/playthroughApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { GameOverviewRowDto } from '../library/types';

const THUMBNAIL_BASE = '/api/thumbnails';

/** Unique games (by gameUid) with at least one instance */
function uniqueGames(rows: GameOverviewRowDto[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.gameUid)) return false;
    seen.add(r.gameUid);
    return r.hasInstance;
  });
}

/** Instance rows for a given game */
function instancesForGame(
  rows: GameOverviewRowDto[],
  gameUid: string
): GameOverviewRowDto[] {
  return rows.filter(
    (r) => r.gameUid === gameUid && r.gameInstanceUid != null
  );
}

export default function AddPlaythroughPage() {
  const { isLoaded } = useReferenceData();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GameOverviewRowDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGameUid, setSelectedGameUid] = useState<string | null>(null);
  const [selectedInstanceUid, setSelectedInstanceUid] = useState<string | null>(
    null
  );
  const [startedAt, setStartedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = async () => {
    setSearching(true);
    setError(null);
    setSelectedGameUid(null);
    setSelectedInstanceUid(null);
    try {
      const rows = await searchGameOverview(searchText);
      setSearchResults(rows);
    } catch {
      setError('Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const games = uniqueGames(searchResults);
  const instances = selectedGameUid
    ? instancesForGame(searchResults, selectedGameUid)
    : [];

  const selectedGame = games.find((g) => g.gameUid === selectedGameUid);
  const selectedInstance = instances.find(
    (i) => i.gameInstanceUid === selectedInstanceUid
  );

  const handleSelectGame = (gameUid: string) => {
    setSelectedGameUid(gameUid);
    setSelectedInstanceUid(null);
  };

  const handleSubmit = async () => {
    if (!selectedInstanceUid) return;
    setSubmitting(true);
    setError(null);
    try {
      const playthrough = await PlaythroughApi.create({
        gameInstanceUid: selectedInstanceUid,
        startedAt,
      });
      navigate(`/playthroughs/${playthrough.uid}`);
    } catch {
      setError('Failed to create playthrough.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <Typography variant="h4" gutterBottom>
        Add Playthrough
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Part 1: Search & game selection — always visible */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
        1. Search and select game
      </Typography>
      <Box display="flex" gap={2} alignItems="center" sx={{ mb: 1 }}>
        <TextField
          label="Search game"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), doSearch())}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <Button type="button" variant="contained" onClick={doSearch} disabled={searching}>
          Search
        </Button>
      </Box>
      {searching && <CircularProgress size={24} sx={{ mb: 2 }} />}
      {!searching && games.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 3 }}>
          {games.map((g) => (
            <li key={g.gameUid}>
              <Button
                type="button"
                variant={selectedGameUid === g.gameUid ? 'contained' : 'outlined'}
                onClick={() => handleSelectGame(g.gameUid)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  mb: 1,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  width: '100%',
                }}
              >
                {g.thumbnailImageUid ? (
                  <Box
                    component="img"
                    src={`${THUMBNAIL_BASE}/${g.thumbnailImageUid}`}
                    alt=""
                    width={40}
                    height={40}
                    sx={{
                      objectFit: 'cover',
                      borderRadius: 1,
                      bgcolor: 'grey.300',
                    }}
                  />
                ) : (
                  <Box
                    width={40}
                    height={40}
                    bgcolor="grey.300"
                    sx={{ borderRadius: 1 }}
                  />
                )}
                <Typography>{g.gameName}</Typography>
              </Button>
            </li>
          ))}
        </Box>
      )}
      {!searching && searchResults.length > 0 && games.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          No games with instances found.
        </Typography>
      )}

      {/* Part 2: Instance selection — unlocks when game selected */}
      {selectedGameUid != null && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
            2. Select game instance
          </Typography>
          {selectedGame && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Game: {selectedGame.gameName}
            </Typography>
          )}
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 3 }}>
            {instances.map((r) => (
              <li key={r.gameInstanceUid!}>
                <Button
                  type="button"
                  variant={
                    selectedInstanceUid === r.gameInstanceUid
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => setSelectedInstanceUid(r.gameInstanceUid!)}
                  sx={{
                    mb: 1,
                    display: 'block',
                    textAlign: 'left',
                    textTransform: 'none',
                  }}
                >
                  {r.platformName ?? r.platformUid} ·{' '}
                  {r.variantName ?? r.variantUid}
                </Button>
              </li>
            ))}
          </Box>
        </>
      )}

      {/* Part 3: Metadata — unlocks when instance selected */}
      {selectedInstanceUid != null && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
            3. Start date
          </Typography>
          {selectedInstance && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Instance: {selectedInstance.gameName} · {selectedInstance.platformName} · {selectedInstance.variantName}
            </Typography>
          )}
          <TextField
            type="date"
            label="Started at"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ maxWidth: 200, mb: 3 }}
          />
        </>
      )}

      {/* Submit — enabled when instance + startedAt */}
      {selectedInstanceUid != null && (
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? 'Creating…' : 'Create Playthrough'}
        </Button>
      )}
    </Box>
  );
}
