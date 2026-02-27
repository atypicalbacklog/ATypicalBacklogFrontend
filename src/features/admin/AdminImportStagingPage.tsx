import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { AdminImportApi } from '../../services/adminImportApi';
import type {
  StagedGameSummaryDto,
  StagedPlaythroughGroupSummaryDto,
  StagedResolutionStatus,
} from '../../types/adminImport';

const STATUS_ORDER: StagedResolutionStatus[] = [
  'CREATED',
  'UPDATED',
  'CURATED',
  'FINALIZED',
  'IMPORTED',
];

export default function AdminImportStagingPage() {
  const { referenceData } = useReferenceData();
  const playthroughTypes = referenceData?.data?.playthroughTypes ?? [];
  const playthroughTypeName = (uid: string | null) =>
    uid ? playthroughTypes.find((t) => t.uid === uid)?.name ?? uid : '—';

  const [tabIndex, setTabIndex] = useState(0);

  // Staged Games tab
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number> | null>(null);
  const [countsLoading, setCountsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'' | StagedResolutionStatus>('');
  const [stagedGames, setStagedGames] = useState<StagedGameSummaryDto[] | null>(null);
  const [stagedGamesLoading, setStagedGamesLoading] = useState(false);
  const [stagedGamesError, setStagedGamesError] = useState<string | null>(null);

  // Playthrough groups tab
  const [unmappedOnly, setUnmappedOnly] = useState(true);
  const [playthroughGroups, setPlaythroughGroups] = useState<
    StagedPlaythroughGroupSummaryDto[] | null
  >(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // When Staged Games tab is selected, fetch counts by status
  useEffect(() => {
    if (tabIndex !== 0) return;
    const key = 'admin-import-counts';
    if (!initialFetchBegin(key)) return;
    setCountsLoading(true);
    AdminImportApi.getStagedGameCountsByStatus()
      .then(setCountsByStatus)
      .catch(() => setCountsByStatus(null))
      .finally(() => {
        setCountsLoading(false);
        initialFetchEnd(key);
      });
  }, [tabIndex]);

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

  const loadPlaythroughGroups = async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const data = await AdminImportApi.listStagedPlaythroughGroups(unmappedOnly);
      setPlaythroughGroups(data);
    } catch (e) {
      setGroupsError(
        e instanceof Error ? e.message : 'Failed to load staged playthrough groups'
      );
      setPlaythroughGroups(null);
    } finally {
      setGroupsLoading(false);
    }
  };

  const statusLabelWithCount = (status: '' | StagedResolutionStatus) => {
    if (status === '') {
      if (countsByStatus == null) return 'All';
      const total = STATUS_ORDER.reduce((sum, s) => sum + (countsByStatus[s] ?? 0), 0);
      return `All (${total})`;
    }
    const count = countsByStatus?.[status] ?? 0;
    return `${status} (${count})`;
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Admin – Import staging
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search and list staged games and staged playthrough groups. Not linked in app navigation.
      </Typography>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="Staged games" id="staging-tab-0" aria-controls="staging-panel-0" />
        <Tab label="Playthrough groups" id="staging-tab-1" aria-controls="staging-panel-1" />
      </Tabs>

      {/* Tab 1: Staged games */}
      <Box
        role="tabpanel"
        id="staging-panel-0"
        aria-labelledby="staging-tab-0"
        hidden={tabIndex !== 0}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as '' | StagedResolutionStatus)
                }
                disabled={countsLoading}
              >
                <MenuItem value="">
                  {countsLoading ? 'Loading counts…' : statusLabelWithCount('')}
                </MenuItem>
                {STATUS_ORDER.map((status) => (
                  <MenuItem key={status} value={status}>
                    {countsLoading ? status : statusLabelWithCount(status)}
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
            <Typography color="error" variant="body2">
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
                  <ListItemButton
                    key={g.uid}
                    component={Link}
                    to={`/admin/import/staged-games/${g.uid}`}
                    divider
                  >
                    <ListItemText
                      primary={g.proposedName || g.uid}
                      secondary={`UID: ${g.uid} · ${g.resolutionStatus}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          )}
        </Stack>
      </Box>

      {/* Tab 2: Playthrough groups */}
      <Box
        role="tabpanel"
        id="staging-panel-1"
        aria-labelledby="staging-tab-1"
        hidden={tabIndex !== 1}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Mapped
              </Typography>
              <Switch
                checked={unmappedOnly}
                onChange={(_, c) => setUnmappedOnly(c)}
                color="primary"
              />
              <Typography variant="body2" color="text.secondary">
                Unmapped
              </Typography>
            </Stack>
            <Button
              variant="contained"
              size="small"
              onClick={loadPlaythroughGroups}
              disabled={groupsLoading}
            >
              {groupsLoading ? 'Loading…' : `Load ${unmappedOnly ? 'unmapped' : 'mapped'} groups`}
            </Button>
          </Stack>
          {groupsError && (
            <Typography color="error" variant="body2">
              {groupsError}
            </Typography>
          )}
          {playthroughGroups !== null && (
            <List dense disablePadding sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
              {playthroughGroups.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary={
                      unmappedOnly
                        ? 'No unmapped staged playthrough groups.'
                        : 'No mapped staged playthrough groups.'
                    }
                  />
                </ListItem>
              ) : (
                playthroughGroups.map((g) => {
                  const typeName = playthroughTypeName(g.inferredTypeUid ?? null);
                  const primary =
                    g.importedName != null && g.importedName !== ''
                      ? `${g.importedName} – ${typeName}`
                      : typeName !== '—'
                        ? `${g.uid} – ${typeName}`
                        : g.uid;
                  return (
                    <ListItemButton
                      key={g.uid}
                      component={Link}
                      to={`/admin/import/staged-playthrough-groups/${g.uid}`}
                      divider
                    >
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
                    </ListItemButton>
                  );
                })
              )}
            </List>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
