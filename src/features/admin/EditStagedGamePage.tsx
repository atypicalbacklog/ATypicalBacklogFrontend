import { useEffect, useState, useRef } from 'react';
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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CallToActionIcon from '@mui/icons-material/CallToAction';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ImageIcon from '@mui/icons-material/Image';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { AdminImportApi } from '../../services/adminImportApi';
import { GameApi } from '../../services/gameApi';
import { IgdbApi } from '../../services/igdbApi';
import { searchGames } from '../../services/gameSearchApi';
import type { StagedGameDetailDto, StagedResolutionStatus, UpdateStagedGameRequest } from '../../types/adminImport';
import type { GameQueryResultDto } from '../../types/dto';
import type { IgdbGameSearchResultDto } from '../../services/igdbApi';
import { resolveVariantAndOriginalFromExternalGame } from './stagedGameResolutionUtils';
import DateField from '../catalog/components/DateField';
import SearchSuggestions from '../catalog/components/SearchSuggestions';
import type { SearchResultItem } from '../catalog/components/SearchSuggestions';
import SelectedItemChip from '../catalog/components/SelectedItemChip';
import ExternalGameSearch from '../shared/ExternalGameSearch';
import PlatformSelect from '../shared/PlatformSelect';

export default function EditStagedGamePage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { referenceData } = useReferenceData();
  const initialResolutionStatusRef = useRef<StagedResolutionStatus | null>(null);
  const [detail, setDetail] = useState<StagedGameDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [proposedName, setProposedName] = useState('');
  const [proposedReleaseDate, setProposedReleaseDate] = useState('');
  const [proposedReceivedDate, setProposedReceivedDate] = useState('');
  const [proposedVariantUid, setProposedVariantUid] = useState<string>('');
  const [proposedPlatformUid, setProposedPlatformUid] = useState<string>('');
  const [proposedCompletionStateUid, setProposedCompletionStateUid] = useState<string>('');
  const [backlogStartDate, setBacklogStartDate] = useState('');
  const [backlogEndDate, setBacklogEndDate] = useState('');
  const [backlogReason, setBacklogReason] = useState('');
  const [matchedGameUid, setMatchedGameUid] = useState<string | null>(null);
  const [matchedExternalIgdbId, setMatchedExternalIgdbId] = useState<string | null>(null);
  const [matchedOriginalConsoleUid, setMatchedOriginalConsoleUid] = useState<string>('');
  const [selectedInternalGame, setSelectedInternalGame] = useState<GameQueryResultDto | null>(null);
  const [selectedExternalGame, setSelectedExternalGame] = useState<IgdbGameSearchResultDto | null>(null);
  const [confirmedExternalGame, setConfirmedExternalGame] = useState<IgdbGameSearchResultDto | null>(null);

  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState<SearchResultItem[]>([]);
  const [internalSearchNoResults, setInternalSearchNoResults] = useState(false);

  const [showDirectExternalIdInput, setShowDirectExternalIdInput] = useState(false);
  const [directExternalIdValue, setDirectExternalIdValue] = useState('');
  const [directExternalGameResult, setDirectExternalGameResult] = useState<IgdbGameSearchResultDto | null>(null);
  const [directExternalLoading, setDirectExternalLoading] = useState(false);
  const [directExternalError, setDirectExternalError] = useState<string | null>(null);
  const [directExternalSelectedActions, setDirectExternalSelectedActions] = useState<string[]>(['name']);
  
  const autoMatchTimeoutRef = useRef<number | null>(null);

  const variants = referenceData?.data?.variants ?? [];
  const completionStates = referenceData?.data?.completionStates ?? [];
  const playthroughTypes = referenceData?.data?.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data?.playthroughStates ?? [];
  const consoles = referenceData?.data?.consoles ?? [];
  const platforms = referenceData?.data?.platforms ?? [];

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    AdminImportApi.getStagedGame(uid)
      .then((d) => {
        setDetail(d);
        initialResolutionStatusRef.current = d.resolutionStatus;
        const name = d.proposedName ?? '';
        setProposedName(name);
        setGameSearchQuery(name);
        setProposedReleaseDate(d.proposedReleaseDate ?? '');
        setProposedReceivedDate(d.proposedReceivedDate ?? '');
        setProposedVariantUid(d.proposedVariantUid ?? '');
        setProposedPlatformUid(d.proposedPlatformUid ?? '');
        setProposedCompletionStateUid(d.proposedCompletionStateUid ?? '');
        setBacklogStartDate(d.backlogStartDate ?? '');
        setBacklogEndDate(d.backlogEndDate ?? '');
        setBacklogReason(d.backlogReason ?? '');
        setMatchedGameUid(d.matchedGameUid ?? null);
        setMatchedExternalIgdbId(d.matchedExternalIgdbId ?? null);
        setMatchedOriginalConsoleUid(d.matchedOriginalConsoleUid ?? '');
      })
      .catch(() => setError('Failed to load staged game'))
      .finally(() => setLoading(false));
  }, [uid]);

  useEffect(() => {
    if (!gameSearchQuery.trim() || gameSearchQuery.length < 2) {
      setGameSearchResults([]);
      setInternalSearchNoResults(false);
      return;
    }
    const t = setTimeout(() => {
      searchGames(gameSearchQuery)
        .then((rows) => {
          setGameSearchResults(
            rows.map((r) => ({
              id: r.gameUid,
              name: r.name,
              coverImageUid: r.coverImageUid,
              subtitle: r.releaseDate ?? undefined,
            }))
          );
          setInternalSearchNoResults(rows.length === 0);
        })
        .catch(() => {
          setGameSearchResults([]);
          setInternalSearchNoResults(false);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [gameSearchQuery]);

  useEffect(() => {
    if (!detail?.matchedGameUid || selectedInternalGame?.gameUid === detail.matchedGameUid) return;
    GameApi.get(detail.matchedGameUid)
      .then((g) =>
        setSelectedInternalGame({
          gameUid: g.uid,
          name: g.name,
          releaseDate: g.firstReleaseDate ?? null,
          coverImageUid: g.coverImageUid,
        })
      )
      .catch(() => {});
  }, [detail?.matchedGameUid, selectedInternalGame?.gameUid]);

  // Auto-match internal game when name changes (debounced)
  useEffect(() => {
    if (!proposedName.trim() || proposedName.length < 2 || matchedGameUid) {
      return;
    }
    if (autoMatchTimeoutRef.current) {
      clearTimeout(autoMatchTimeoutRef.current);
    }
    autoMatchTimeoutRef.current = setTimeout(() => {
      searchGames(proposedName)
        .then((results) => {
          // Auto-match if exactly one result and name matches closely
          if (results.length === 1) {
            const match = results[0];
            const normalizedName = proposedName.trim().toLowerCase();
            const normalizedMatch = match.name.toLowerCase();
            // Match if names are very similar (exact match or one contains the other)
            if (
              normalizedName === normalizedMatch ||
              normalizedName.includes(normalizedMatch) ||
              normalizedMatch.includes(normalizedName)
            ) {
              setMatchedGameUid(match.gameUid);
              setSelectedInternalGame({
                gameUid: match.gameUid,
                name: match.name,
                releaseDate: match.releaseDate,
                coverImageUid: match.coverImageUid,
              });
            }
          }
        })
        .catch(() => {});
    }, 800);
    return () => {
      if (autoMatchTimeoutRef.current) {
        clearTimeout(autoMatchTimeoutRef.current);
      }
    };
  }, [proposedName, matchedGameUid]);

  // Auto-match internal game when external game is selected
  useEffect(() => {
    if (!selectedExternalGame || matchedGameUid) return;
    const externalName = selectedExternalGame.name.trim();
    if (!externalName || externalName.length < 2) return;
    searchGames(externalName)
      .then((results) => {
        if (results.length === 1) {
          const match = results[0];
          const normalizedExternal = externalName.toLowerCase();
          const normalizedMatch = match.name.toLowerCase();
          if (
            normalizedExternal === normalizedMatch ||
            normalizedExternal.includes(normalizedMatch) ||
            normalizedMatch.includes(normalizedExternal)
          ) {
            setMatchedGameUid(match.gameUid);
            setSelectedInternalGame({
              gameUid: match.gameUid,
              name: match.name,
              releaseDate: match.releaseDate,
              coverImageUid: match.coverImageUid,
            });
          }
        }
      })
      .catch(() => {});
  }, [selectedExternalGame, matchedGameUid]);

  const handleSelectInternalGame = (item: SearchResultItem) => {
    setMatchedGameUid(item.id);
    setSelectedInternalGame({
      gameUid: item.id,
      name: item.name,
      releaseDate: item.subtitle ?? null,
      coverImageUid: item.coverImageUid,
    });
    setGameSearchQuery('');
    setGameSearchResults([]);
  };

  const handleSetExternalId = (externalId: string) => {
    setMatchedExternalIgdbId(externalId);
    if (selectedExternalGame) {
      setConfirmedExternalGame(selectedExternalGame);
      // Resolve variant & original console if not yet set
      const needVariant = !proposedVariantUid || proposedVariantUid === '';
      const needOriginal = !matchedOriginalConsoleUid || matchedOriginalConsoleUid === '';
      if ((needVariant || needOriginal) && (consoles.length > 0 && platforms.length > 0 && variants.length > 0)) {
        const resolved = resolveVariantAndOriginalFromExternalGame(
          selectedExternalGame,
          proposedPlatformUid,
          proposedVariantUid,
          matchedOriginalConsoleUid,
          consoles,
          platforms,
          variants
        );
        if (needVariant && resolved.variantUid) {
          setProposedVariantUid(resolved.variantUid);
        }
        if (needOriginal && resolved.originalConsoleUid) {
          setMatchedOriginalConsoleUid(resolved.originalConsoleUid);
        }
      }
    }
  };

  const handleClearExternalId = () => {
    setMatchedExternalIgdbId(null);
    setConfirmedExternalGame(null);
  };

  const applyExternalGameResolution = (result: IgdbGameSearchResultDto) => {
    const needVariant = !proposedVariantUid || proposedVariantUid === '';
    const needOriginal = !matchedOriginalConsoleUid || matchedOriginalConsoleUid === '';
    if ((needVariant || needOriginal) && consoles.length > 0 && platforms.length > 0 && variants.length > 0) {
      const resolved = resolveVariantAndOriginalFromExternalGame(
        result,
        proposedPlatformUid,
        proposedVariantUid,
        matchedOriginalConsoleUid,
        consoles,
        platforms,
        variants
      );
      if (needVariant && resolved.variantUid) setProposedVariantUid(resolved.variantUid);
      if (needOriginal && resolved.originalConsoleUid) setMatchedOriginalConsoleUid(resolved.originalConsoleUid);
    }
  };

  const handleLoadDirectExternalId = async () => {
    const id = directExternalIdValue.trim();
    const num = parseInt(id, 10);
    if (!id || Number.isNaN(num)) {
      setDirectExternalError('Enter a valid numeric IGDB ID');
      return;
    }
    setDirectExternalLoading(true);
    setDirectExternalError(null);
    try {
      const result = await IgdbApi.getByExternalId(num);
      setDirectExternalGameResult(result);
      const actions: string[] = ['name'];
      if (result.releaseDate) actions.push('date');
      if (result.coverImageUrl) actions.push('image');
      if (actions.length === 3) actions.push('all');
      setDirectExternalSelectedActions(actions);
    } catch {
      setDirectExternalError('Failed to load game');
      setDirectExternalGameResult(null);
    } finally {
      setDirectExternalLoading(false);
    }
  };

  const handleDirectExternalToggleAction = (action: string) => {
    setDirectExternalSelectedActions((prev) => {
      const isSelected = prev.includes(action);
      if (action === 'all') {
        if (isSelected) return [];
        return ['name', 'date', 'image', 'all'];
      }
      if (isSelected) {
        const next = prev.filter((a) => a !== action && a !== 'all');
        return next;
      }
      const next = [...prev.filter((a) => a !== 'all'), action];
      const hasAllThree = ['name', 'date', 'image'].every((a) => a === action || next.includes(a));
      if (hasAllThree) next.push('all');
      return next;
    });
  };

  const handleDirectExternalConfirm = () => {
    const result = directExternalGameResult;
    if (!result) return;
    if (directExternalSelectedActions.includes('all') || directExternalSelectedActions.includes('name')) {
      setProposedName(result.name);
    }
    if (directExternalSelectedActions.includes('all') || directExternalSelectedActions.includes('date')) {
      if (result.releaseDate) setProposedReleaseDate(result.releaseDate);
    }
    setMatchedExternalIgdbId(String(result.externalId));
    setConfirmedExternalGame(result);
    applyExternalGameResolution(result);
    setDirectExternalGameResult(null);
    setShowDirectExternalIdInput(false);
    setDirectExternalIdValue('');
    setDirectExternalError(null);
  };

  const handleDirectExternalAbort = () => {
    setDirectExternalGameResult(null);
    setShowDirectExternalIdInput(false);
    setDirectExternalIdValue('');
    setDirectExternalError(null);
  };

  const handleSave = async (resolutionStatus: 'CURATED' | 'FINALIZED') => {
    if (!uid) return;
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    const body: UpdateStagedGameRequest = {
      proposedName: proposedName || null,
      proposedReleaseDate: proposedReleaseDate || null,
      proposedReceivedDate: proposedReceivedDate || null,
      proposedVariantUid: proposedVariantUid || null,
      proposedPlatformUid: proposedPlatformUid || null,
      matchedOriginalConsoleUid: matchedOriginalConsoleUid || null,
      proposedCompletionStateUid: proposedCompletionStateUid || null,
      backlogStartDate: backlogStartDate || null,
      backlogEndDate: backlogEndDate || null,
      backlogReason: backlogReason || null,
      matchedGameUid: matchedGameUid ?? null,
      matchedExternalIgdbId: matchedExternalIgdbId ?? null,
      resolutionStatus,
    };
    try {
      const updated = await AdminImportApi.updateStagedGame(uid, body);
      // Preserve playthroughGroups if not in response
      setDetail({
        ...updated,
        playthroughGroups: updated.playthroughGroups ?? detail?.playthroughGroups ?? [],
      });
      setSaveSuccess(true);
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const typeName = (typeUid: string | null) =>
    typeUid ? playthroughTypes.find((t) => t.uid === typeUid)?.name ?? typeUid : '—';
  const stateName = (stateUid: string | null) =>
    stateUid ? playthroughStates.find((s) => s.uid === stateUid)?.name ?? stateUid : '—';

  const handleNext = async () => {
    const status = initialResolutionStatusRef.current ?? undefined;
    const list = await AdminImportApi.listStagedGames(status);
    const idx = list.findIndex((g) => g.uid === uid);
    if (idx >= 0 && idx < list.length - 1) {
      navigate(`/admin/import/staged-games/${list[idx + 1].uid}`);
    } else {
      navigate('/admin/import/staging');
    }
  };

  if (!uid) return <Typography color="error">Missing UID</Typography>;
  if (loading) return <CircularProgress />;
  if (error && !detail) return <Typography color="error">{error}</Typography>;
  if (!detail) return <Typography color="error">Staged game not found</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <Button component={Link} to="/admin/import/staging" size="small">
          ← Back to staging
        </Button>
        <Button variant="outlined" size="small" onClick={handleNext}>
          Next
        </Button>
        <Typography variant="h6">Edit staged game</Typography>
        <Typography variant="body2" color="text.secondary">
          {detail.uid}
        </Typography>
        <Chip label={`Status: ${detail.resolutionStatus}`} size="small" color="primary" variant="outlined" />
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
            Name & dates
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              label="Name"
              value={proposedName}
              onChange={(e) => setProposedName(e.target.value)}
              size="small"
              sx={{ minWidth: 240 }}
            />
            <Box sx={{ flexShrink: 0 }}>
              <ExternalGameSearch
                gameName={proposedName}
                releaseDate={proposedReleaseDate}
                onOverwriteName={setProposedName}
                onOverwriteDate={setProposedReleaseDate}
                onMarkCoverImport={() => {}}
                ownerType="GAME"
                ownerUid={null}
                onSetExternalId={handleSetExternalId}
                onSelectedResultChange={setSelectedExternalGame}
              />
            </Box>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <DateField
              label="Release date"
              value={proposedReleaseDate}
              onChange={setProposedReleaseDate}
            />
            <DateField
              label="Received date"
              value={proposedReceivedDate}
              onChange={setProposedReceivedDate}
            />
          </Stack>
          {matchedExternalIgdbId && (
            <Typography variant="caption" color="text.secondary">
              External IGDB ID: {matchedExternalIgdbId}
              <Button size="small" sx={{ ml: 1 }} onClick={handleClearExternalId}>
                Clear
              </Button>
            </Typography>
          )}

          {!showDirectExternalIdInput && !directExternalGameResult && (
            <Button size="small" variant="outlined" onClick={() => setShowDirectExternalIdInput(true)}>
              Set external ID directly
            </Button>
          )}
          {showDirectExternalIdInput && !directExternalGameResult && (
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <TextField
                label="IGDB game ID"
                value={directExternalIdValue}
                onChange={(e) => setDirectExternalIdValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoadDirectExternalId()}
                size="small"
                type="number"
                placeholder="e.g. 12345"
                sx={{ width: 140 }}
                error={!!directExternalError}
                helperText={directExternalError}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={handleLoadDirectExternalId}
                disabled={directExternalLoading}
              >
                {directExternalLoading ? 'Loading…' : 'Load'}
              </Button>
              <Button size="small" onClick={handleDirectExternalAbort}>
                Cancel
              </Button>
            </Stack>
          )}
          {directExternalGameResult && (
            <Stack direction="row" spacing={1} alignItems="stretch" sx={{ mt: 1 }}>
              <Card variant="outlined" sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: 400 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {directExternalGameResult.coverImageUrl ? (
                      <Box
                        component="img"
                        src={directExternalGameResult.coverImageUrl}
                        alt=""
                        sx={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }}
                      />
                    ) : (
                      <Box sx={{ width: 40, height: 56, bgcolor: 'action.hover', borderRadius: 0.5, flexShrink: 0 }} />
                    )}
                    <Stack flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight="medium">
                        {directExternalGameResult.name}
                      </Typography>
                      {directExternalGameResult.releaseDate && (
                        <Typography variant="caption" color="text.secondary">
                          {directExternalGameResult.releaseDate}
                          {directExternalGameResult.category ? ` · ${directExternalGameResult.category}` : ''}
                        </Typography>
                      )}
                      {directExternalGameResult.releaseDates && directExternalGameResult.releaseDates.length > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {directExternalGameResult.releaseDates
                            .filter((rd) => rd.platformAbbreviation?.trim())
                            .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
                            .map((rd) => (rd.date ? `${rd.platformAbbreviation} (${rd.date})` : rd.platformAbbreviation))
                            .slice(0, 5)
                            .join(', ')}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
              <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ flexShrink: 0 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: 128,
                  }}
                >
                  <ToggleButton
                    value="name"
                    selected={directExternalSelectedActions.includes('name')}
                    onClick={() => handleDirectExternalToggleAction('name')}
                    aria-label="Set name"
                    color="primary"
                    sx={{ width: 64, height: 48, p: 0, borderRight: 1, borderBottom: 1, borderColor: 'divider' }}
                  >
                    <CallToActionIcon />
                  </ToggleButton>
                  <ToggleButton
                    value="date"
                    selected={directExternalSelectedActions.includes('date')}
                    onClick={() => handleDirectExternalToggleAction('date')}
                    disabled={!directExternalGameResult.releaseDate}
                    aria-label="Set date"
                    color="primary"
                    sx={{ width: 64, height: 48, p: 0, borderBottom: 1, borderColor: 'divider' }}
                  >
                    <CalendarMonthIcon />
                  </ToggleButton>
                  <ToggleButton
                    value="image"
                    selected={directExternalSelectedActions.includes('image')}
                    onClick={() => handleDirectExternalToggleAction('image')}
                    disabled={!directExternalGameResult.coverImageUrl}
                    aria-label="Set image"
                    color="primary"
                    sx={{ width: 64, height: 48, p: 0, borderRight: 1, borderColor: 'divider' }}
                  >
                    <ImageIcon />
                  </ToggleButton>
                  <ToggleButton
                    value="all"
                    selected={directExternalSelectedActions.includes('all')}
                    onClick={() => handleDirectExternalToggleAction('all')}
                    aria-label="Do all 3"
                    color="primary"
                    sx={{ width: 64, height: 48, p: 0 }}
                  >
                    <Stack direction="row" spacing={0.2} sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }}>
                      <CallToActionIcon />
                      <CalendarMonthIcon />
                      <ImageIcon />
                    </Stack>
                  </ToggleButton>
                </Box>
                <Stack spacing={0.5} alignItems="center">
                  <IconButton size="small" onClick={handleDirectExternalConfirm} color="primary" aria-label="Confirm">
                    <CheckIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleDirectExternalAbort} color="default" aria-label="Cancel">
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Variant & platform
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Variant</InputLabel>
              <Select
                label="Variant"
                value={proposedVariantUid}
                onChange={(e) => setProposedVariantUid(e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {variants.map((v) => (
                  <MenuItem key={v.uid} value={v.uid}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ minWidth: 200 }}>
              <PlatformSelect
                value={proposedPlatformUid}
                onChange={(v) => {
                  if (v != null) setProposedPlatformUid(typeof v === 'string' ? v : (Array.isArray(v) && v[0]) || '');
                }}
                label="Platform"
                allowEmpty
                emptyLabel="—"
                size="small"
                fullWidth={false}
              />
            </Box>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Original Console</InputLabel>
            <Select
              label="Original Console"
              value={matchedOriginalConsoleUid}
              onChange={(e) => setMatchedOriginalConsoleUid(e.target.value)}
            >
              <MenuItem value="">—</MenuItem>
              {consoles.map((c) => (
                <MenuItem key={c.uid} value={c.uid}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Completion state</InputLabel>
          <Select
            label="Completion state"
            value={proposedCompletionStateUid}
            onChange={(e) => setProposedCompletionStateUid(e.target.value)}
          >
            <MenuItem value="">—</MenuItem>
            {completionStates.map((c) => (
              <MenuItem key={c.uid} value={c.uid}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Backlog
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <DateField label="Backlog start" value={backlogStartDate} onChange={setBacklogStartDate} />
            <DateField label="Backlog end" value={backlogEndDate} onChange={setBacklogEndDate} />
          </Stack>
          <TextField
            label="Backlog reason"
            value={backlogReason}
            onChange={(e) => setBacklogReason(e.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Match to internal game
          </Typography>
          <Box>
            <TextField
              label="Search existing game"
              value={gameSearchQuery}
              onChange={(e) => setGameSearchQuery(e.target.value)}
              size="small"
              placeholder={'Type to search...'}
              sx={{ minWidth: 280, mb: 1 }}
            />
            <SearchSuggestions
              results={gameSearchResults}
              onSelect={handleSelectInternalGame}
              emptyMessage={'No games found'}
            />
            {internalSearchNoResults && (
              <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                Search without result
              </Typography>
            )}
          </Box>
          {matchedGameUid && selectedInternalGame && (
            <SelectedItemChip
              label={selectedInternalGame.name}
              coverImageUid={selectedInternalGame.coverImageUid}
              onClear={() => {
                setMatchedGameUid(null);
                setSelectedInternalGame(null);
              }}
            />
          )}
          {matchedGameUid && !selectedInternalGame && (
            <Typography variant={'body2'} color={'text.secondary'}>
              Matched game UID: {matchedGameUid}
              <Button size="small" sx={{ ml: 1 }} onClick={() => setMatchedGameUid(null)}>
                Clear
              </Button>
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => handleSave('CURATED')}
            disabled={saving}
            color="primary"
          >
            {saving ? 'Saving...' : 'Update'}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave('FINALIZED')}
            disabled={saving}
            color="success"
          >
            {saving ? 'Saving...' : 'ReadyToImport'}
          </Button>
        </Stack>

        {detail.playthroughGroups && detail.playthroughGroups.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Linked playthrough groups
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
              {detail.playthroughGroups.map((pg) => (
                <Card key={pg.uid} variant="outlined" sx={{ minWidth: 260, maxWidth: 320 }}>
                  <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {pg.importedName || pg.uid}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      UID: {pg.uid}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Batch: {pg.importBatchUid}
                    </Typography>
                    {pg.stagedGameUid && (
                      <Typography variant="caption" component="div" color="text.secondary">
                        Staged game: {pg.stagedGameUid}
                      </Typography>
                    )}
                    <Typography variant="caption" component="div" color="text.secondary">
                      Type: {typeName(pg.inferredTypeUid)}
                    </Typography>
                    {pg.inferredYear != null && (
                      <Typography variant="caption" component="div" color="text.secondary">
                        Year: {pg.inferredYear}
                      </Typography>
                    )}
                    <Typography variant="caption" component="div" color="text.secondary">
                      State: {stateName(pg.proposedPlaythroughStateUid)}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Status: {pg.resolutionStatus}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
          </Stack>
        </Box>

        {confirmedExternalGame && (
          <Box sx={{ flexShrink: 0, width: 320, ml: 3, position: 'relative', zIndex: 0 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  External Game Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {confirmedExternalGame.coverImageUrl && (
                  <Box
                    component="img"
                    src={confirmedExternalGame.coverImageUrl}
                    alt=""
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 1,
                      mb: 2,
                    }}
                  />
                )}
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  {confirmedExternalGame.name}
                </Typography>
                {confirmedExternalGame.releaseDate && (
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Release: {confirmedExternalGame.releaseDate}
                  </Typography>
                )}
                {confirmedExternalGame.category && (
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Category: {confirmedExternalGame.category}
                  </Typography>
                )}
                {confirmedExternalGame.releaseDates && confirmedExternalGame.releaseDates.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
                      Platforms:
                    </Typography>
                    <Stack spacing={0.5}>
                      {confirmedExternalGame.releaseDates
                        .filter((rd) => rd.platformAbbreviation != null && rd.platformAbbreviation.trim() !== '')
                        .sort((a, b) => {
                          const da = a.date ?? '';
                          const db = b.date ?? '';
                          if (da && db) return da.localeCompare(db);
                          if (da) return -1;
                          if (db) return 1;
                          return 0;
                        })
                        .map((rd, idx) => (
                          <Typography key={idx} variant="caption" color="text.secondary" display="block">
                            {rd.platformAbbreviation}
                            {rd.date && ` (${rd.date})`}
                            {rd.region != null && ` [Region: ${rd.region}]`}
                          </Typography>
                        ))}
                    </Stack>
                  </Box>
                )}
                {confirmedExternalGame.releasedPlatforms &&
                  confirmedExternalGame.releasedPlatforms.length > 0 &&
                  (!confirmedExternalGame.releaseDates || confirmedExternalGame.releaseDates.length === 0) && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Platforms: {confirmedExternalGame.releasedPlatforms.join(', ')}
                    </Typography>
                  )}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  IGDB ID: {confirmedExternalGame.externalId}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
