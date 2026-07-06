import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import {
  fetchBacklogRecommendations,
  searchUnifiedGames,
} from '../../services/backlogRecommendationApi';
import type {
  BacklogRecommendationViewDto,
  UnifiedGameSearchResultDto,
} from '../../types/backlogRecommendationDto';
import BacklogSubmissionCreateModal from './BacklogSubmissionCreateModal';
import BacklogSubmissionDetailModal from './BacklogSubmissionDetailModal';
import BacklogSubmissionList from './BacklogSubmissionList';
import { landingCtaButtonSx } from '../landing/landingCtaButtonStyles';
import UnifiedGameSearchPanel from './UnifiedSearchPanels';
import {
  gameUidsWithBacklogSubmission,
  listItemsFromSearchRecommendations,
  unifiedPanelGameResults,
} from './unifiedSearchResultUtils';

const SEARCH_MIN_LENGTH = 2;

export default function BacklogSubmissionsPage() {
  const [items, setItems] = useState<BacklogRecommendationViewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rawSearchResults, setRawSearchResults] = useState<UnifiedGameSearchResultDto[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [detailSelection, setDetailSelection] = useState<{
    uid: string;
    voteRank?: number;
  } | null>(null);
  const [upvotedUids, setUpvotedUids] = useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createFromSearch, setCreateFromSearch] =
    useState<UnifiedGameSearchResultDto | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBacklogRecommendations();
      setItems(data);
    } catch {
      setError('Failed to load backlog submissions.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const key = 'backlog-submissions-list';
    if (!initialFetchBegin(key)) return;
    loadList().finally(() => initialFetchEnd(key));
  }, [loadList]);

  useEffect(() => {
    const q = searchDraft.trim();
    if (q.length < SEARCH_MIN_LENGTH) {
      setSearchQuery('');
      setRawSearchResults([]);
      setSearchError(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setSearchQuery(q);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    if (!searchQuery) return;

    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);
    searchUnifiedGames(searchQuery)
      .then((data) => {
        if (cancelled) return;
        setRawSearchResults(data);
      })
      .catch(() => {
        if (cancelled) return;
        setSearchError('Search failed.');
        setRawSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const isSearchActive = searchQuery.length >= SEARCH_MIN_LENGTH;

  const unifiedPanelGames = useMemo(
    () => unifiedPanelGameResults(rawSearchResults),
    [rawSearchResults]
  );

  const submissionGameUids = useMemo(
    () => gameUidsWithBacklogSubmission(rawSearchResults, items),
    [rawSearchResults, items]
  );

  const displayedListItems = useMemo(
    () =>
      isSearchActive
        ? listItemsFromSearchRecommendations(rawSearchResults, items)
        : items,
    [isSearchActive, rawSearchResults, items]
  );

  const openCreate = (fromSearch?: UnifiedGameSearchResultDto | null) => {
    setCreateFromSearch(fromSearch ?? null);
    setCreateOpen(true);
  };

  const handleUpvoted = useCallback((submissionUid: string, voteCount: number) => {
    setUpvotedUids((prev) => new Set(prev).add(submissionUid));
    setItems((prev) =>
      prev.map((row) => (row.uid === submissionUid ? { ...row, voteCount } : row))
    );
    setRawSearchResults((prev) =>
      prev.map((row) =>
        row.backlogRecommendationUid === submissionUid ? { ...row, voteCount } : row
      )
    );
  }, []);

  const handleSaved = () => {
    setSearchDraft('');
    setSearchQuery('');
    setRawSearchResults([]);
    void loadList();
  };

  const listEmptyMessage = isSearchActive
    ? `No backlog submissions match "${searchQuery}".`
    : 'No backlog submissions yet.';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Backlog submissions
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Search games and submissions"
          placeholder="Search by name…"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: { sm: 420 } }}
        />
        <Button
          variant="contained"
          onClick={() => openCreate(null)}
          sx={{
            ...landingCtaButtonSx,
            flexShrink: 0,
            alignSelf: { xs: 'flex-start', sm: 'center' },
          }}
        >
          Add backlog submission
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isSearchActive && searchError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSearchError(null)}>
          {searchError}
        </Alert>
      )}

      {isSearchActive && searchLoading ? (
        <Stack alignItems="center" sx={{ py: 2, mb: 2 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}

      {isSearchActive && !searchLoading ? (
        <UnifiedGameSearchPanel
          results={unifiedPanelGames}
          submissionGameUids={submissionGameUids}
          onAddSubmission={(result) => openCreate(result)}
        />
      ) : null}

      {loading && !isSearchActive ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Box>
          {isSearchActive ? (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Matching backlog submissions
            </Typography>
          ) : null}
          <BacklogSubmissionList
            items={displayedListItems}
            emptyMessage={listEmptyMessage}
            onSelect={(uid, voteRank) => setDetailSelection({ uid, voteRank })}
          />
        </Box>
      )}

      <BacklogSubmissionDetailModal
        uid={detailSelection?.uid ?? null}
        listVoteRank={detailSelection?.voteRank}
        open={detailSelection != null}
        onClose={() => setDetailSelection(null)}
        hasUpvoted={
          detailSelection != null && upvotedUids.has(detailSelection.uid)
        }
        onUpvoted={handleUpvoted}
      />

      <BacklogSubmissionCreateModal
        open={createOpen}
        initialFromSearch={createFromSearch}
        onClose={() => {
          setCreateOpen(false);
          setCreateFromSearch(null);
        }}
        onSaved={handleSaved}
      />
    </Box>
  );
}
