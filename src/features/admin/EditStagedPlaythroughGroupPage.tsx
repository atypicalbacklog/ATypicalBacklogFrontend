import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { AdminImportApi } from '../../services/adminImportApi';
import type {
  StagedGameDetailDto,
  StagedPlaythroughGroupDetailDto,
  UpdateStagedPlaythroughGroupRequest,
} from '../../types/adminImport';
import type { StagedPlaythroughGroupInDetailDto } from '../../types/adminImport';

export default function EditStagedPlaythroughGroupPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { referenceData } = useReferenceData();
  const [detail, setDetail] = useState<StagedPlaythroughGroupDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState('');
  const [stagedGameUid, setStagedGameUid] = useState<string | null>(null);
  const [linkedStagedGame, setLinkedStagedGame] = useState<StagedGameDetailDto | null>(null);

  const [inferredTypeUid, setInferredTypeUid] = useState<string>('');
  const [inferredYear, setInferredYear] = useState<string>('');
  const [proposedPlaythroughStateUid, setProposedPlaythroughStateUid] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StagedGameDetailDto[]>([]);
  const [searching, setSearching] = useState(false);

  const platforms = referenceData?.data?.platforms ?? [];
  const completionStates = referenceData?.data?.completionStates ?? [];
  const playthroughTypes = referenceData?.data?.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data?.playthroughStates ?? [];

  const platformName = (platformUid: string | null) =>
    platformUid ? platforms.find((p) => p.uid === platformUid)?.name ?? platformUid : '—';
  const completionStateName = (uid: string | null) =>
    uid ? completionStates.find((c) => c.uid === uid)?.name ?? uid : '—';
  const playthroughTypeName = (typeUid: string | null) =>
    typeUid ? playthroughTypes.find((t) => t.uid === typeUid)?.name ?? typeUid : '—';

  useEffect(() => {
    if (!uid) return;
    const key = `edit-staged-playthrough-group-${uid}`;
    if (!initialFetchBegin(key)) return;
    setLoading(true);
    setError(null);
    AdminImportApi.getStagedPlaythroughGroup(uid)
      .then((d) => {
        setDetail(d);
        const displayName = d.importedPlaythroughName ?? d.importedName ?? '';
        setName(displayName);
        setStagedGameUid(d.stagedGameUid ?? null);
        setSearchQuery(displayName);
        setInferredTypeUid(d.inferredTypeUid ?? '');
        setInferredYear(d.inferredYear != null ? String(d.inferredYear) : '');
        setProposedPlaythroughStateUid(d.proposedPlaythroughStateUid ?? '');
      })
      .catch(() => setError('Failed to load staged playthrough group'))
      .finally(() => {
        setLoading(false);
        initialFetchEnd(key);
      });
  }, [uid]);

  // Refetch linked staged game when stagedGameUid is set (on load or when user selects one)
  useEffect(() => {
    if (!stagedGameUid) {
      setLinkedStagedGame(null);
      return;
    }
    const key = `edit-staged-playthrough-group-linked-${stagedGameUid}`;
    if (!initialFetchBegin(key)) return;
    AdminImportApi.getStagedGame(stagedGameUid)
      .then(setLinkedStagedGame)
      .catch(() => setLinkedStagedGame(null))
      .finally(() => initialFetchEnd(key));
  }, [stagedGameUid]);

  // Preset proposed playthrough state when inferred year is not this year: use linked game's completion state
  useEffect(() => {
    const yearNum = inferredYear === '' ? null : parseInt(inferredYear, 10);
    if (yearNum == null || Number.isNaN(yearNum)) return;
    const currentYear = new Date().getFullYear();
    if (yearNum === currentYear) return;
    if (!linkedStagedGame || !playthroughStates.length || !completionStates.length) return;

    const completionStateUid = linkedStagedGame.proposedCompletionStateUid ?? null;
    const completionState = completionStateUid
      ? completionStates.find((c) => c.uid === completionStateUid)
      : null;
    const completionName = (completionState?.name ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

    let targetPlaythroughStateName: string;
    if (completionName === 'abandoned' || completionName.includes('abandoned')) {
      targetPlaythroughStateName = 'Abandoned';
    } else if (
      completionName === 'finished' ||
      completionName === 'finishedplus' ||
      completionName.includes('finished')
    ) {
      targetPlaythroughStateName = 'Finished';
    } else {
      targetPlaythroughStateName = 'Inactive';
    }

    const playthroughState = playthroughStates.find(
      (s) => s.name.toLowerCase() === targetPlaythroughStateName.toLowerCase()
    );
    if (playthroughState) {
      setProposedPlaythroughStateUid(playthroughState.uid);
    }
  }, [linkedStagedGame, inferredYear, playthroughStates, completionStates]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    AdminImportApi.searchStagedGames(searchQuery)
      .then(setSearchResults)
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  };

  const handleSave = async (resolutionStatus: 'CURATED' | 'FINALIZED') => {
    if (!uid) return;
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    const body: UpdateStagedPlaythroughGroupRequest = {
      importedName: name || null,
      stagedGameUid: stagedGameUid ?? null,
      inferredTypeUid: inferredTypeUid || null,
      inferredYear:
        inferredYear === '' ? null : (() => {
          const n = parseInt(inferredYear, 10);
          return Number.isNaN(n) ? null : n;
        })(),
      proposedPlaythroughStateUid: proposedPlaythroughStateUid || null,
      resolutionStatus,
    };
    try {
      const updated = await AdminImportApi.updateStagedPlaythroughGroup(uid, body);
      setDetail(updated);
      setSaveSuccess(true);
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  /** Linked groups sorted by year descending */
  function linkedGroupsDesc(groups: StagedPlaythroughGroupInDetailDto[]): StagedPlaythroughGroupInDetailDto[] {
    return [...groups].sort((a, b) => (b.inferredYear ?? 0) - (a.inferredYear ?? 0));
  }

  const handleNext = async () => {
    const list = await AdminImportApi.listStagedPlaythroughGroups(true);
    const idx = list.findIndex((g) => g.uid === uid);
    if (idx >= 0 && idx < list.length - 1) {
      navigate(`/admin/import/staged-playthrough-groups/${list[idx + 1].uid}`);
    } else {
      navigate('/admin/import/staging');
    }
  };

  if (!uid) return <Typography color="error">Missing UID</Typography>;
  if (loading) return <CircularProgress />;
  if (error && !detail) return <Typography color="error">{error}</Typography>;
  if (!detail) return <Typography color="error">Staged playthrough group not found</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <Button component={Link} to="/admin/import/staging" size="small">
          ← Back to staging
        </Button>
        <Button variant="outlined" size="small" onClick={handleNext}>
          Next
        </Button>
        <Typography variant="h6">Edit staged playthrough group</Typography>
        <Typography variant="body2" color="text.secondary">
          {detail.uid}
        </Typography>
        <Chip
          label={`Status: ${detail.resolutionStatus}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(false)}>
          Saved.
        </Alert>
      )}

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: 720 }}>
          <Stack spacing={3}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Name & status
              </Typography>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                sx={{ maxWidth: 400 }}
              />
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Link to staged game
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField
                  label="Search staged games"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  size="small"
                  placeholder="Name"
                  sx={{ minWidth: 280 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={searching ? <CircularProgress size={16} /> : <SearchIcon />}
                  onClick={handleSearch}
                  disabled={searching}
                >
                  Search
                </Button>
              </Stack>

              {!stagedGameUid && searchResults.length > 0 && (
                <List dense disablePadding sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                  {searchResults.map((sg) => (
                    <ListItem key={sg.uid} disablePadding divider>
                      <ListItemButton onClick={() => setStagedGameUid(sg.uid)}>
                        <Stack spacing={0.5} sx={{ py: 0.5, width: '100%' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {sg.proposedName || sg.uid}
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Platform: {platformName(sg.proposedPlatformUid)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Release: {sg.proposedReleaseDate ?? '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Received: {sg.proposedReceivedDate ?? '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Backlog: {sg.backlogStartDate ?? '—'} – {sg.backlogEndDate ?? '—'}
                              {sg.backlogReason ? ` · ${sg.backlogReason}` : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Completion: {completionStateName(sg.proposedCompletionStateUid)}
                            </Typography>
                          </Stack>
                          {sg.playthroughGroups && sg.playthroughGroups.length > 0 && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Linked groups (by year desc):{' '}
                              {linkedGroupsDesc(sg.playthroughGroups)
                                .map((pg) => `${pg.importedName ?? pg.uid} (${pg.inferredYear ?? '?'})`)
                                .join(', ')}
                            </Typography>
                          )}
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}

              {stagedGameUid && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Linked staged game
                  </Typography>
                  <Button size="small" onClick={() => setStagedGameUid(null)}>
                    Unlink
                  </Button>
                </Stack>
              )}
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Other metadata
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Inferred type</InputLabel>
                  <Select
                    label="Inferred type"
                    value={inferredTypeUid}
                    onChange={(e) => setInferredTypeUid(e.target.value)}
                  >
                    <MenuItem value="">—</MenuItem>
                    {playthroughTypes.map((t) => (
                      <MenuItem key={t.uid} value={t.uid}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Inferred year"
                  type="number"
                  value={inferredYear}
                  onChange={(e) => setInferredYear(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ min: 1900, max: 2100 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Proposed playthrough state</InputLabel>
                  <Select
                    label="Proposed playthrough state"
                    value={proposedPlaythroughStateUid}
                    onChange={(e) => setProposedPlaythroughStateUid(e.target.value)}
                  >
                    <MenuItem value="">—</MenuItem>
                    {playthroughStates.map((s) => (
                      <MenuItem key={s.uid} value={s.uid}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => handleSave('CURATED')}
                disabled={saving}
                color="primary"
              >
                {saving ? 'Saving…' : 'Update'}
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave('FINALIZED')}
                disabled={saving}
                color="success"
              >
                {saving ? 'Saving…' : 'ReadyToImport'}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {linkedStagedGame && (
          <Box sx={{ flexShrink: 0, width: 320, ml: 3, position: 'relative', zIndex: 0 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Linked staged game
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  {linkedStagedGame.proposedName || linkedStagedGame.uid}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Platform: {platformName(linkedStagedGame.proposedPlatformUid)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Release: {linkedStagedGame.proposedReleaseDate ?? '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Received: {linkedStagedGame.proposedReceivedDate ?? '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Backlog: {linkedStagedGame.backlogStartDate ?? '—'} – {linkedStagedGame.backlogEndDate ?? '—'}
                  {linkedStagedGame.backlogReason ? ` · ${linkedStagedGame.backlogReason}` : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Completion: {completionStateName(linkedStagedGame.proposedCompletionStateUid)}
                </Typography>
                {linkedStagedGame.playthroughGroups && linkedStagedGame.playthroughGroups.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
                      Linked groups (by year desc):
                    </Typography>
                    <Stack spacing={0.5}>
                      {linkedGroupsDesc(linkedStagedGame.playthroughGroups).map((pg) => (
                        <Typography key={pg.uid} variant="caption" color="text.secondary" display="block">
                          {pg.importedName ?? pg.uid} ({pg.inferredYear ?? '?'})
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
                <Button size="small" sx={{ mt: 2 }} onClick={() => setStagedGameUid(null)}>
                  Unlink
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
