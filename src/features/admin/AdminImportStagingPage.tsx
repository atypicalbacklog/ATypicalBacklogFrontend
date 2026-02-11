import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { AdminImportApi } from '../../services/adminImportApi';
import type {
  StagedGameSummaryDto,
  StagedPlaythroughGroupSummaryDto,
  StagedResolutionStatus,
} from '../../types/adminImport';

const STATUS_OPTIONS: { value: '' | StagedResolutionStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'CREATED', label: 'CREATED' },
  { value: 'UPDATED', label: 'UPDATED' },
  { value: 'CURATED', label: 'CURATED' },
  { value: 'FINALIZED', label: 'FINALIZED' },
  { value: 'IMPORTED', label: 'IMPORTED' },
];

export default function AdminImportStagingPage() {
  const { referenceData } = useReferenceData();
  const playthroughTypes = referenceData?.data?.playthroughTypes ?? [];
  const playthroughTypeName = (uid: string | null) =>
    uid ? playthroughTypes.find((t) => t.uid === uid)?.name ?? uid : '—';

  const [statusFilter, setStatusFilter] = useState<'' | StagedResolutionStatus>('');
  const [stagedGames, setStagedGames] = useState<StagedGameSummaryDto[] | null>(null);
  const [stagedGamesLoading, setStagedGamesLoading] = useState(false);
  const [stagedGamesError, setStagedGamesError] = useState<string | null>(null);

  const [unmappedGroups, setUnmappedGroups] = useState<
    StagedPlaythroughGroupSummaryDto[] | null
  >(null);
  const [unmappedLoading, setUnmappedLoading] = useState(false);
  const [unmappedError, setUnmappedError] = useState<string | null>(null);

  const loadStagedGames = async () => {
    setStagedGamesLoading(true);
    setStagedGamesError(null);
    try {
      const status = statusFilter || undefined;
      const data = await AdminImportApi.listStagedGames(status);
      setStagedGames(data);
    } catch (e) {
      setStagedGamesError(e instanceof Error ? e.message : 'Failed to load staged games');
      setStagedGames(null);
    } finally {
      setStagedGamesLoading(false);
    }
  };

  const loadUnmappedGroups = async () => {
    setUnmappedLoading(true);
    setUnmappedError(null);
    try {
      const data = await AdminImportApi.listUnmappedStagedPlaythroughGroups();
      setUnmappedGroups(data);
    } catch (e) {
      setUnmappedError(
        e instanceof Error ? e.message : 'Failed to load unmapped playthrough groups'
      );
      setUnmappedGroups(null);
    } finally {
      setUnmappedLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Admin – Import staging
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Search and list staged games and unmapped staged playthrough groups. Not linked in app
        navigation.
      </Typography>

      <Stack spacing={4}>
        {/* Staged Games */}
        <Box>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Staged games
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as '' | StagedResolutionStatus)
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              onClick={loadStagedGames}
              disabled={stagedGamesLoading}
            >
              {stagedGamesLoading ? 'Loading…' : 'Load staged games'}
            </Button>
          </Stack>
          {stagedGamesError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {stagedGamesError}
            </Typography>
          )}
          {stagedGames !== null && (
            <List dense disablePadding sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
              {stagedGames.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No staged games found." />
                </ListItem>
              ) : (
                stagedGames.map((g) => (
                  <ListItem key={g.uid} divider>
                    <ListItemText
                      primary={g.proposedName || g.uid}
                      secondary={`UID: ${g.uid} · ${g.resolutionStatus}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Box>

        {/* Unmapped staged playthrough groups */}
        <Box>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Staged playthrough groups (unmapped)
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={loadUnmappedGroups}
              disabled={unmappedLoading}
            >
              {unmappedLoading ? 'Loading…' : 'Load unmapped groups'}
            </Button>
          </Stack>
          {unmappedError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {unmappedError}
            </Typography>
          )}
          {unmappedGroups !== null && (
            <List dense disablePadding sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
              {unmappedGroups.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No unmapped staged playthrough groups." />
                </ListItem>
              ) : (
                unmappedGroups.map((g) => {
                  const typeName = playthroughTypeName(g.inferredTypeUid ?? null);
                  const primary =
                    g.importedName != null && g.importedName !== ''
                      ? `${g.importedName} – ${typeName}`
                      : typeName !== '—'
                        ? `${g.uid} – ${typeName}`
                        : g.uid;
                  return (
                    <ListItem key={g.uid} divider>
                      <ListItemText
                        primary={primary}
                        secondary={
                          [
                            `UID: ${g.uid}`,
                            `Batch: ${g.importBatchUid}`,
                            g.stagedGameUid ? `Staged game: ${g.stagedGameUid}` : null,
                            g.inferredYear != null ? `Year: ${g.inferredYear}` : null,
                            g.proposedPlaythroughStateUid != null
                              ? `State: ${g.proposedPlaythroughStateUid}`
                              : null,
                            `Status: ${g.resolutionStatus}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  );
                })
              )}
            </List>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
