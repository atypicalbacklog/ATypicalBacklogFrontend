import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { PlaythroughApi } from '../../services/playthroughApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import StepSection from '../catalog/components/StepSection';
import DateField from '../catalog/components/DateField';
import SelectedItemChip from '../catalog/components/SelectedItemChip';
import type { GameOverviewRowDto } from '../library/types';

/** Rows that have an instance (one row per instance), excluding DLC rows. */
function instanceRows(rows: GameOverviewRowDto[]): GameOverviewRowDto[] {
  return rows.filter(
    (r) => r.gameInstanceUid != null && !r.isDlc
  );
}

export default function AddPlaythroughPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GameOverviewRowDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedInstanceUid, setSelectedInstanceUid] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [playthroughTypeUid, setPlaythroughTypeUid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const instanceList = instanceRows(searchResults);
  const selectedInstance = instanceList.find(
    (r) => r.gameInstanceUid === selectedInstanceUid
  );

  const step1Valid = selectedInstanceUid != null;
  const step2Valid = step1Valid && startedAt && !!playthroughTypeUid;
  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];

  useEffect(() => {
    if (!searchText.trim() || searchText.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      searchGameOverviewForPlaythrough(searchText)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const handleSelectInstance = useCallback((gameInstanceUid: string) => {
    setSelectedInstanceUid(gameInstanceUid);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedInstanceUid) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const playthrough = await PlaythroughApi.create({
        gameInstanceUid: selectedInstanceUid,
        startedAt,
        playthroughTypeUid: playthroughTypeUid || undefined,
      });
      setSuccessMessage('Playthrough created.');
      setTimeout(() => navigate(`/playthroughs/${playthrough.uid}`), 1500);
    } catch {
      setError('Failed to create playthrough.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedInstanceUid, startedAt, playthroughTypeUid, navigate]);

  if (!isLoaded || !referenceData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const displayName = (r: GameOverviewRowDto) =>
    r.instanceName ?? r.gameName;
  const displayImageUid = (r: GameOverviewRowDto) =>
    r.instanceCoverImageUid ?? r.coverImageUid;

  const instanceLabel = selectedInstance
    ? [displayName(selectedInstance), selectedInstance.platformName, selectedInstance.variantName]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h4" gutterBottom>
        Add Playthrough
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Start a new playthrough for a game instance.
      </Typography>

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

      <StepSection title="Step 1 — Search and select game instance">
        <Stack spacing={2}>
          <TextField
            label="Search game"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            size="small"
            placeholder="Type to search"
          />
          {selectedInstanceUid && selectedInstance ? (
            <SelectedItemChip
              label={instanceLabel}
              coverImageUid={displayImageUid(selectedInstance)}
              onClear={() => setSelectedInstanceUid(null)}
            />
          ) : (
            <>
              {searching && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Searching…
                  </Typography>
                </Stack>
              )}
              {!searching && instanceList.length > 0 && (
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
                        onClick={() => handleSelectInstance(r.gameInstanceUid!)}
                        selected={selectedInstanceUid === r.gameInstanceUid}
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
              {!searching && searchText.length >= 2 && instanceList.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No game instances found.
                </Typography>
              )}
            </>
          )}
        </Stack>
      </StepSection>

      <StepSection title="Step 2 — Start date and type" locked={!step1Valid}>
        <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
          <DateField
            label="Started at"
            value={startedAt}
            onChange={setStartedAt}
            required
          />
          <TextField
            select
            label="Playthrough type"
            value={playthroughTypeUid}
            onChange={(e) => setPlaythroughTypeUid(e.target.value)}
            required
            size="small"
            sx={{ minWidth: 160 }}
          >
            {playthroughTypes.map((t) => (
              <MenuItem key={t.uid} value={t.uid}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </StepSection>

      <StepSection title="Step 3 — Create" locked={!step2Valid}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !step2Valid}
        >
          {submitting ? 'Creating…' : 'Create Playthrough'}
        </Button>
      </StepSection>
    </Box>
  );
}
