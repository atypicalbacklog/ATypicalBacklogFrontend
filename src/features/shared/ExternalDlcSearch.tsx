import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  ToggleButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CallToActionIcon from '@mui/icons-material/CallToAction';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ImageIcon from '@mui/icons-material/Image';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IgdbApi, type IgdbGameSearchResultDto } from '../../services/igdbApi';

interface Props {
  /** Game instance external IGDB ID (from instance.externalIgdbId). When null/empty, search is disabled. */
  gameInstanceExternalIgdbId: string | null;
  /** Current DLC name (used as optional filter for related content). */
  dlcName: string;
  /** Current release date (for overwrite). */
  releaseDate: string;
  onOverwriteName: (name: string) => void;
  onOverwriteDate: (date: string) => void;
  /** Call when user confirms with image selected; parent should import cover after DLC save (or now if dlcUid set). */
  onMarkCoverImport: (externalId: number) => void;
  /** When set (edit DLC), "Import cover now" is available. */
  dlcUid?: string | null;
  /** When dlcUid set, pass gameInstanceUid for import-cover context. */
  gameInstanceUid?: string | null;
}

/**
 * Search IGDB related content (DLCs, expansions) for a game instance by its external IGDB ID.
 * Same options as ExternalGameSearch: name, date, image toggles; confirm or cancel.
 */
export default function ExternalDlcSearch({
  gameInstanceExternalIgdbId,
  dlcName,
  onOverwriteName,
  onOverwriteDate,
  onMarkCoverImport,
  dlcUid,
  gameInstanceUid,
}: Props) {
  const [results, setResults] = useState<IgdbGameSearchResultDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<IgdbGameSearchResultDto | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const externalIdNum =
    gameInstanceExternalIgdbId != null && gameInstanceExternalIgdbId.trim() !== ''
      ? parseInt(gameInstanceExternalIgdbId.trim(), 10)
      : NaN;
  const canSearch = !Number.isNaN(externalIdNum);

  const handleSearch = async () => {
    if (!canSearch) return;
    setSearching(true);
    setResults([]);
    setSelectedResult(null);
    setSelectedActions([]);
    try {
      const list = await IgdbApi.getRelated(
        externalIdNum,
        dlcName.trim() || undefined
      );
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (result: IgdbGameSearchResultDto) => {
    if (selectedResult?.externalId === result.externalId) {
      setSelectedResult(null);
      setSelectedActions([]);
    } else {
      setSelectedResult(result);
      const actions: string[] = ['name'];
      if (result.releaseDate) actions.push('date');
      if (result.coverImageUrl) actions.push('image');
      if (actions.length === 3) actions.push('all');
      setSelectedActions(actions);
    }
  };

  const handleToggleAction = (action: string) => {
    setSelectedActions((prev) => {
      const isSelected = prev.includes(action);
      if (action === 'all') {
        return isSelected ? [] : ['name', 'date', 'image', 'all'];
      }
      if (isSelected) {
        return prev.filter((a) => a !== action && a !== 'all');
      }
      const next = [...prev.filter((a) => a !== 'all'), action];
      if (['name', 'date', 'image'].every((a) => a === action || next.includes(a))) {
        next.push('all');
      }
      return next;
    });
  };

  const handleCommit = () => {
    if (!selectedResult) return;
    if (selectedActions.includes('all') || selectedActions.includes('name')) {
      onOverwriteName(selectedResult.name);
    }
    if (selectedActions.includes('all') || selectedActions.includes('date')) {
      if (selectedResult.releaseDate) onOverwriteDate(selectedResult.releaseDate);
    }
    if (selectedActions.includes('all') || selectedActions.includes('image')) {
      if (selectedResult.externalId) onMarkCoverImport(selectedResult.externalId);
    }
    setSelectedResult(null);
    setSelectedActions([]);
    setResults([]);
  };

  const handleClose = () => {
    setSelectedResult(null);
    setSelectedActions([]);
    setResults([]);
  };

  const handleImportCoverNow = async () => {
    if (!selectedResult?.externalId || !dlcUid) return;
    setImporting(true);
    try {
      await IgdbApi.importCover({
        externalId: selectedResult.externalId,
        ownerType: 'DLC',
        dlcUid,
        gameInstanceUid: gameInstanceUid ?? undefined,
      });
      setSelectedResult(null);
      setSelectedActions([]);
      setResults([]);
    } catch {
      // Error handling can be added
    } finally {
      setImporting(false);
    }
  };

  const renderResultCard = (result: IgdbGameSearchResultDto, isSelected: boolean) => (
    <Card
      key={result.externalId}
      variant="outlined"
      sx={{
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
      }}
      onClick={() => handleResultClick(result)}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {result.coverImageUrl ? (
            <Box
              component="img"
              src={result.coverImageUrl}
              alt=""
              sx={{
                width: 40,
                height: 56,
                objectFit: 'cover',
                borderRadius: 0.5,
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 56,
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                flexShrink: 0,
              }}
            />
          )}
          <Stack flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {result.name}
            </Typography>
            {(result.releaseDate || result.category) && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {result.releaseDate && (
                  <Typography variant="caption" color="text.secondary">
                    {result.releaseDate}
                  </Typography>
                )}
                {result.category && (
                  <Typography variant="caption" color="text.secondary">
                    {result.category}
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderOptionsAndClose = () =>
    selectedResult ? (
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
            selected={selectedActions.includes('name')}
            onClick={() => handleToggleAction('name')}
            aria-label="Set name"
            color="primary"
            sx={{
              width: 64,
              height: 48,
              p: 0,
              borderRight: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <CallToActionIcon />
          </ToggleButton>
          <ToggleButton
            value="date"
            selected={selectedActions.includes('date')}
            onClick={() => handleToggleAction('date')}
            disabled={!selectedResult.releaseDate}
            aria-label="Set date"
            color="primary"
            sx={{
              width: 64,
              height: 48,
              p: 0,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <CalendarMonthIcon />
          </ToggleButton>
          <ToggleButton
            value="image"
            selected={selectedActions.includes('image')}
            onClick={() => handleToggleAction('image')}
            disabled={!selectedResult.coverImageUrl}
            aria-label="Set image"
            color="primary"
            sx={{
              width: 64,
              height: 48,
              p: 0,
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <ImageIcon />
          </ToggleButton>
          <ToggleButton
            value="all"
            selected={selectedActions.includes('all')}
            onClick={() => handleToggleAction('all')}
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
          {dlcUid && selectedResult.coverImageUrl && (
            <IconButton
              size="small"
              onClick={handleImportCoverNow}
              disabled={importing}
              aria-label="Import cover now"
            >
              {importing ? (
                <CircularProgress size={18} />
              ) : (
                <ImageIcon fontSize="small" />
              )}
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleCommit}
            aria-label="Confirm"
            color={selectedActions.length > 0 ? 'primary' : 'default'}
            disabled={selectedActions.length === 0}
          >
            <CheckIcon />
          </IconButton>
          <IconButton size="small" onClick={handleClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>
    ) : null;

  const searchResults = useMemo(() => {
    if (searching) {
      return (
        <Box display="flex" justifyContent="center" py={1}>
          <CircularProgress size={20} />
        </Box>
      );
    }
    if (results.length === 0) return null;
    if (selectedResult) {
      return (
        <Stack
          direction="row"
          spacing={1}
          alignItems="stretch"
          flexWrap="wrap"
          sx={{
            mt: 1,
            width: '100%',
            maxWidth: { xs: 'min(100%, 300px)', sm: 'none' },
          }}
        >
          <Box
            sx={{ flex: '1 1 auto', cursor: 'pointer', minWidth: { sm: 200 } }}
            onClick={() => handleResultClick(selectedResult)}
          >
            {renderResultCard(selectedResult, true)}
          </Box>
          {renderOptionsAndClose()}
        </Stack>
      );
    }
    return (
      <Box
        sx={{
          mt: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1,
          maxWidth: { xs: 'min(100%, 300px)', sm: 'none' },
          maxHeight: { xs: 'min(60vh, 400px)', sm: 'none' },
          overflowY: { xs: 'auto', sm: 'visible' },
        }}
      >
        {results.map((r) => renderResultCard(r, false))}
      </Box>
    );
  }, [searching, results, selectedResult, selectedActions, dlcUid, importing]);

  if (!canSearch) return null;

  return (
    <Box sx={{ mt: 1, maxWidth: { xs: 'min(100%, 300px)', sm: 'none' } }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={searching ? <CircularProgress size={16} /> : <SearchIcon />}
        onClick={handleSearch}
        disabled={searching}
      >
        Search DLC
      </Button>
      {searchResults}
    </Box>
  );
}
