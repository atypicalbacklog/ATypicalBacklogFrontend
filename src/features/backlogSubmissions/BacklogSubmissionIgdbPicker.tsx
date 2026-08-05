import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { IgdbApi, type IgdbGameSearchResultDto } from '../../services/igdbApi';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;
const PANEL_MAX_HEIGHT = 160;

interface Props {
  query: string;
  externalIgdbId: string | null;
  /** When true, keep showing results but do not search on query changes. */
  searchPaused?: boolean;
  disabled?: boolean;
  onSelect: (result: IgdbGameSearchResultDto) => void;
  onClear?: () => void;
}

export default function BacklogSubmissionIgdbPicker({
  query,
  externalIgdbId,
  searchPaused = false,
  disabled = false,
  onSelect,
  onClear,
}: Props) {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<IgdbGameSearchResultDto[]>([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (disabled) {
      setResults([]);
      setSearching(false);
      setSearchedQuery('');
      return;
    }

    if (searchPaused) {
      setSearching(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearching(false);
      setSearchedQuery('');
      return;
    }

    // Same query as last search (e.g. after Clear) — keep existing results.
    if (trimmed === searchedQuery) {
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeoutId = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;
      void IgdbApi.search(trimmed)
        .then((next) => {
          if (requestId !== requestIdRef.current) return;
          setResults(next);
          setSearchedQuery(trimmed);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setSearchedQuery(trimmed);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, disabled, searchPaused, searchedQuery]);

  if (disabled) return null;

  const showEmpty =
    !searching &&
    searchedQuery.length >= MIN_QUERY_LENGTH &&
    results.length === 0;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        flexShrink: 0,
        height: PANEL_MAX_HEIGHT,
        maxHeight: PANEL_MAX_HEIGHT,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        position: 'relative',
        alignSelf: 'flex-start',
      }}
    >
      {externalIgdbId && onClear ? (
        <Chip
          label="Clear"
          size="small"
          onClick={onClear}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1,
            height: 26,
            fontSize: '0.8125rem',
            fontWeight: 600,
            bgcolor: 'rgba(0,0,0,0.65)',
            color: 'info.light',
            '& .MuiChip-label': { px: 1.25 },
            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
          }}
        />
      ) : null}

      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          p: 0.5,
          boxSizing: 'border-box',
        }}
      >
        {searching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={18} />
          </Box>
        ) : showEmpty ? null : (
          <Stack spacing={0.5}>
            {results.map((result) => {
              const selected = externalIgdbId === String(result.externalId);
              return (
                <Card
                  key={result.externalId}
                  variant="outlined"
                  sx={{
                    cursor: searchPaused ? 'default' : 'pointer',
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'action.selected' : 'background.paper',
                  }}
                  onClick={() => {
                    if (!searchPaused) onSelect(result);
                  }}
                >
                  <CardContent sx={{ py: 0.5, px: 0.75, '&:last-child': { pb: 0.5 } }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      {result.coverImageUrl ? (
                        <Box
                          component="img"
                          src={result.coverImageUrl}
                          alt=""
                          sx={{
                            width: 22,
                            height: 32,
                            objectFit: 'cover',
                            borderRadius: 0.5,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 22,
                            height: 32,
                            borderRadius: 0.5,
                            flexShrink: 0,
                            bgcolor: 'action.hover',
                          }}
                        />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          noWrap
                          display="block"
                          fontWeight={selected ? 700 : 500}
                          sx={{ lineHeight: 1.2 }}
                        >
                          {result.name}
                        </Typography>
                        {result.releaseDate ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            display="block"
                            sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                          >
                            {result.releaseDate}
                          </Typography>
                        ) : null}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
