import { useState } from 'react';
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IgdbApi, type IgdbGameSearchResultDto } from '../../services/igdbApi';

interface Props {
  gameName: string;
  externalIgdbId: string | null;
  disabled?: boolean;
  onConfirm: (result: IgdbGameSearchResultDto) => void;
  onClear?: () => void;
}

export default function BacklogSubmissionIgdbPicker({
  gameName,
  externalIgdbId,
  disabled = false,
  onConfirm,
  onClear,
}: Props) {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<IgdbGameSearchResultDto[]>([]);
  const [selectedResult, setSelectedResult] = useState<IgdbGameSearchResultDto | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleSearch = async () => {
    if (disabled || !gameName.trim() || gameName.length < 2) return;
    setPanelOpen(true);
    setSearching(true);
    setSelectedResult(null);
    setSelectedActions([]);
    try {
      setResults(await IgdbApi.search(gameName));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (result: IgdbGameSearchResultDto) => {
    if (selectedResult?.externalId === result.externalId) {
      setSelectedResult(null);
      setSelectedActions([]);
      return;
    }
    const actions = ['name'];
    if (result.releaseDate) actions.push('date');
    setSelectedResult(result);
    setSelectedActions(actions);
  };

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const handleConfirm = () => {
    if (!selectedResult || selectedActions.length === 0) return;
    onConfirm(selectedResult);
    setPanelOpen(false);
    setSelectedResult(null);
    setSelectedActions([]);
    setResults([]);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    setSelectedResult(null);
    setSelectedActions([]);
    setResults([]);
  };

  if (disabled) return null;

  return (
    <Box sx={{ position: 'relative', flexShrink: 0, alignSelf: 'flex-start', mt: 0.5 }}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          onClick={() => void handleSearch()}
          disabled={!gameName.trim() || gameName.length < 2 || searching}
          size="small"
          aria-label="Search IGDB"
        >
          {searching ? <CircularProgress size={20} /> : <SearchIcon />}
        </IconButton>
        {externalIgdbId ? (
          <Stack direction="row" spacing={0.25} alignItems="center">
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 72 }}>
              ID {externalIgdbId}
            </Typography>
            {onClear ? (
              <IconButton size="small" onClick={onClear} aria-label="Clear IGDB link" sx={{ p: 0.25 }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      {panelOpen ? (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 0.5,
            zIndex: 10,
            width: { xs: 'min(calc(100vw - 48px), 420px)', sm: 420 },
          }}
        >
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={20} />
            </Box>
          ) : selectedResult ? (
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Card
                variant="outlined"
                sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => handleSelect(selectedResult)}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" spacing={1}>
                    {selectedResult.coverImageUrl ? (
                      <Box
                        component="img"
                        src={selectedResult.coverImageUrl}
                        alt=""
                        sx={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 0.5 }}
                      />
                    ) : null}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {selectedResult.name}
                      </Typography>
                      {selectedResult.releaseDate ? (
                        <Typography variant="caption" color="text.secondary">
                          {selectedResult.releaseDate}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ToggleButton
                  value="name"
                  selected={selectedActions.includes('name')}
                  onClick={() => toggleAction('name')}
                  size="small"
                  sx={{ width: 40, height: 40 }}
                >
                  <CallToActionIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton
                  value="date"
                  selected={selectedActions.includes('date')}
                  onClick={() => toggleAction('date')}
                  disabled={!selectedResult.releaseDate}
                  size="small"
                  sx={{ width: 40, height: 40 }}
                >
                  <CalendarMonthIcon fontSize="small" />
                </ToggleButton>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleConfirm}
                  disabled={selectedActions.length === 0}
                  aria-label="Confirm IGDB link"
                >
                  <CheckIcon />
                </IconButton>
                <IconButton size="small" onClick={handleClosePanel} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Stack>
          ) : results.length > 0 ? (
            <Stack spacing={0.5}>
              {results.map((result) => (
                <Card
                  key={result.externalId}
                  variant="outlined"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSelect(result)}
                >
                  <CardContent sx={{ py: 0.75, '&:last-child': { pb: 0.75 } }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {result.coverImageUrl ? (
                        <Box
                          component="img"
                          src={result.coverImageUrl}
                          alt=""
                          sx={{ width: 28, height: 40, objectFit: 'cover', borderRadius: 0.5 }}
                        />
                      ) : null}
                      <Typography variant="body2" noWrap>
                        {result.name}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <IconButton size="small" onClick={handleClosePanel} aria-label="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No IGDB results.
            </Typography>
          )}
        </Box>
      ) : null}
    </Box>
  );
}