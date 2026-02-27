import { useState, useMemo } from 'react';
import {
  Box,
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
  /** Current game/instance name (used as search query). */
  gameName: string;
  /** Current release date (for overwrite). */
  releaseDate: string;
  /** Callback when name should be overwritten (immediate). */
  onOverwriteName: (name: string) => void;
  /** Callback when release date should be overwritten (immediate). */
  onOverwriteDate: (date: string) => void;
  /** Callback when cover should be marked for import. */
  onMarkCoverImport: (externalId: number) => void;
  /** Owner type for cover import. */
  ownerType: 'GAME' | 'GAME_INSTANCE';
  /** Owner UID (gameUid or gameInstanceUid) for cover import. */
  ownerUid: string | null;
  /** Optional: when an external game is committed, set external ID (e.g. IGDB id as string). */
  onSetExternalId?: (externalId: string) => void;
  /** Optional: callback when selected result changes (for displaying details). */
  onSelectedResultChange?: (result: IgdbGameSearchResultDto | null) => void;
}

/**
 * External game database search component (IGDB).
 * When a game is selected, only that item is shown with options on the right; click selected again to deselect.
 */
export default function ExternalGameSearch({
  gameName,
  onOverwriteName,
  onOverwriteDate,
  onMarkCoverImport,
  ownerType,
  ownerUid,
  onSetExternalId,
  onSelectedResultChange,
}: Props) {
  const [results, setResults] = useState<IgdbGameSearchResultDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<IgdbGameSearchResultDto | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!gameName.trim() || gameName.length < 2) {
      setResults([]);
      setSelectedResult(null);
      return;
    }
    setSearching(true);
    try {
      const searchResults = await IgdbApi.search(gameName);
      setResults(searchResults);
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
      onSelectedResultChange?.(null);
    } else {
      setSelectedResult(result);
      onSelectedResultChange?.(result);
      // Preselect all available actions: name (always), date (if available), image (if available)
      const actions: string[] = ['name'];
      if (result.releaseDate) {
        actions.push('date');
      }
      if (result.coverImageUrl) {
        actions.push('image');
      }
      // If all three are available, also add 'all'
      if (actions.length === 3) {
        actions.push('all');
      }
      setSelectedActions(actions);
    }
  };

  const handleToggleAction = (action: string) => {
    setSelectedActions((prev) => {
      const isSelected = prev.includes(action);
      let newActions: string[];
      
      if (action === 'all') {
        // "all" button logic
        if (isSelected) {
          // Deselect all
          newActions = [];
        } else {
          // Select all three + "all"
          newActions = ['name', 'date', 'image', 'all'];
        }
      } else {
        // Individual button logic
        if (isSelected) {
          // Remove this action
          newActions = prev.filter((a) => a !== action && a !== 'all');
        } else {
          // Add this action
          newActions = [...prev.filter((a) => a !== 'all'), action];
          // Check if all three are now selected
          const hasAllThree = ['name', 'date', 'image'].every((a) => 
            a === action || newActions.includes(a)
          );
          if (hasAllThree) {
            newActions.push('all');
          }
        }
      }
      
      return newActions;
    });
  };

  const handleCommit = () => {
    if (!selectedResult) return;

    if (selectedActions.includes('all') || selectedActions.includes('name')) {
      onOverwriteName(selectedResult.name);
    }
    if (selectedActions.includes('all') || selectedActions.includes('date')) {
      if (selectedResult.releaseDate) {
        onOverwriteDate(selectedResult.releaseDate);
      }
    }
    if (selectedActions.includes('all') || selectedActions.includes('image')) {
      if (selectedResult.externalId) {
        onMarkCoverImport(selectedResult.externalId);
      }
    }
    if (selectedResult.externalId != null && onSetExternalId) {
      onSetExternalId(String(selectedResult.externalId));
    }

    // Close search and clear selection
    setSelectedResult(null);
    onSelectedResultChange?.(null);
    setSelectedActions([]);
    setResults([]);
  };

  const handleClose = () => {
    setSelectedResult(null);
    onSelectedResultChange?.(null);
    setSelectedActions([]);
    setResults([]);
  };

  const handleImportCoverNow = async () => {
    if (!selectedResult?.externalId || !ownerUid) return;
    setImporting(true);
    try {
      await IgdbApi.importCover({
        externalId: selectedResult.externalId,
        ownerType,
        ...(ownerType === 'GAME'
          ? { gameUid: ownerUid }
          : { gameInstanceUid: ownerUid }),
      });
      setSelectedResult(null);
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
            {(() => {
              const releaseDates = result.releaseDates?.filter(
                (rd) => rd.platformAbbreviation != null && rd.platformAbbreviation.trim() !== ''
              );
              if (releaseDates && releaseDates.length > 0) {
                const sorted = [...releaseDates].sort((a, b) => {
                  const da = a.date ?? '';
                  const db = b.date ?? '';
                  if (da && db) return da.localeCompare(db);
                  if (da) return -1;
                  if (db) return 1;
                  return 0;
                });
                return (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {sorted.map((rd, idx) => (
                      <Typography key={idx} variant="caption" color="text.secondary">
                        {rd.platformAbbreviation}
                        {rd.date && ` (${rd.date})`}
                      </Typography>
                    ))}
                  </Box>
                );
              }
              if (result.releasedPlatforms && result.releasedPlatforms.length > 0) {
                return (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {result.releasedPlatforms.map((platform, idx) => (
                      <Typography key={idx} variant="caption" color="text.secondary">
                        {platform}
                      </Typography>
                    ))}
                  </Box>
                );
              }
              return null;
            })()}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const searchButton = (
    <IconButton
      onClick={handleSearch}
      disabled={!gameName.trim() || gameName.length < 2 || searching}
      size="small"
      sx={{ order: 1 }}
    >
      {searching ? <CircularProgress size={20} /> : <SearchIcon />}
    </IconButton>
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
            width: 128, // 64 * 2
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
              borderRightColor: 'divider',
              borderBottom: 1,
              borderBottomColor: 'divider',
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
              borderBottomColor: 'divider',
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
              borderRightColor: 'divider',
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
            sx={{
              width: 64,
              height: 48,
              p: 0,
            }}
          >
            <Stack direction="row" spacing={0.2} sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }}>
              <CallToActionIcon />
              <CalendarMonthIcon />
              <ImageIcon />
            </Stack>
          </ToggleButton>
        </Box>
        <Stack spacing={0.5} alignItems="center">
          {ownerUid && selectedResult.coverImageUrl && (
            <IconButton
              size="small"
              onClick={handleImportCoverNow}
              disabled={importing}
              aria-label="Import cover now"
            >
              {importing ? <CircularProgress size={18} /> : <ImageIcon fontSize="small" />}
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleCommit}
            aria-label="Confirm and close"
            color={selectedActions.length > 0 ? 'primary' : 'default'}
            disabled={selectedActions.length === 0}
            title={`Selected: ${selectedActions.join(', ') || 'none'}`}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label="Close without confirming"
            color="default"
          >
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
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{ flex: '1 1 auto', cursor: 'pointer', minWidth: { xs: 0, sm: 0 } }}
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
          position: 'relative',
          zIndex: 1,
          maxWidth: { xs: 'min(100%, 300px)', sm: 'none' },
          maxHeight: { xs: 'min(60vh, 400px)', sm: 'none' },
          overflowY: { xs: 'auto', sm: 'visible' },
        }}
      >
        {results.map((result) => renderResultCard(result, false))}
      </Box>
    );
  }, [searching, results, selectedResult, selectedActions, ownerUid, importing]);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {searchButton}
      </Box>
      <Box sx={{ width: '100%', maxWidth: { xs: 'min(100%, 300px)', sm: 'none' }, order: 10, mt: 1 }}>
        {searchResults}
      </Box>
    </>
  );
}
