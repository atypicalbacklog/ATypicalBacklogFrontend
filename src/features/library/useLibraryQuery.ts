import { useCallback, useEffect, useRef, useState } from 'react';
import { http } from '../../services/httpClient';
import { GameOverviewQueryResponseDto, GameOverviewRowDto, LibraryFilterState } from './types';

/** Rows per keyset page*/
export const LIBRARY_PAGE_SIZE = 200;

/** Backend keyset pagination is only supported for sortMode=NAME_ASC. */
function isPaginatedSort(sortMode: string) {
  return sortMode === 'NAME_ASC';
}

/** Map UI filter state to API request body (empty arrays → null for "no filter"). If platform is set, console filter is ignored. */
function toQueryRequestBody(f: LibraryFilterState, cursorRow?: GameOverviewRowDto | null) {
  const platformSet = f.platformUids.length > 0;
  const hasPlayedFilter = f.filterMode === 'PLAYED' || f.filterMode === 'UNPLAYED';
  const paginated = isPaginatedSort(f.sortMode);

  // Derive isPlayed and isUnplayed from filterMode
  const isPlayed = f.filterMode === 'PLAYED' ? true : null;
  const isUnplayed = f.filterMode === 'UNPLAYED' ? true : null;

  return {
    searchText: f.searchText || null,
    platformUids: platformSet ? f.platformUids : null,
    consoleUids: platformSet ? null : (f.consoleUids.length ? f.consoleUids : null),
    ignorePorts: f.ignorePorts,
    inBacklog: f.inBacklog,
    hasActivePlaythrough: f.hasActivePlaythrough,
    completionStateUids: !hasPlayedFilter && f.completionStateUids.length
      ? f.completionStateUids
      : null,
    playthroughTypeUids: f.playthroughTypeUids.length
      ? f.playthroughTypeUids
      : null,
    includeDlc: f.includeDlc,
    onlyGamesWithDlc: f.onlyGamesWithDlc,
    isPlayed,
    isUnplayed,
    sortMode: f.sortMode,
    pageSize: paginated ? LIBRARY_PAGE_SIZE : null,
    ...(cursorRow && paginated
      ? {
          cursorGameName: cursorRow.gameName,
          cursorInstanceName: cursorRow.instanceName,
          cursorDlcName: cursorRow.dlcName ?? null,
          cursorGameUid: cursorRow.gameUid,
          cursorGameInstanceUid: cursorRow.gameInstanceUid,
          cursorDlcUid: cursorRow.dlcUid ?? null,
          cursorIsDlc: cursorRow.isDlc ?? false,
        }
      : {}),
  };
}

function queryKey(f: LibraryFilterState): string {
  return JSON.stringify(toQueryRequestBody(f));
}

function extractCounts(result: GameOverviewQueryResponseDto) {
  return {
    gameCount: result.gameCount ?? 0,
    gameInstanceCount: result.gameInstanceCount ?? 0,
    dlcCount: result.dlcCount ?? 0,
    returnedGameCount: result.returnedGameCount ?? 0,
    returnedGameInstanceCount: result.returnedGameInstanceCount ?? 0,
    returnedDlcCount: result.returnedDlcCount ?? 0,
  };
}

export function useLibraryQuery(filters: LibraryFilterState) {
  const [data, setData] = useState<GameOverviewRowDto[]>([]);
  const [counts, setCounts] = useState<Omit<GameOverviewQueryResponseDto, 'rows'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const abortMoreRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const filtersRef = useRef(filters);
  const dataRef = useRef(data);
  filtersRef.current = filters;
  dataRef.current = data;

  const key = queryKey(filters);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // A new filter set invalidates any in-flight "load more".
    setIsLoadingMore(false);
    setHasMore(false);
    abortMoreRef.current?.abort();

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;
      const body = toQueryRequestBody(filtersRef.current);

      setError(null);
      setIsLoading(true);
      // Keep previous rows/counts while fetching so filters stay responsive
      // (unmounting the full card grid blocks typing).

      void (async () => {
        try {
          const result = await http<GameOverviewQueryResponseDto>(
            '/api/query/game-overview',
            {
              method: 'POST',
              body: JSON.stringify(body),
              signal: controller.signal,
            }
          );
          if (requestId !== requestIdRef.current) return;
          const rows = result.rows ?? [];
          setData(rows);
          setCounts(extractCounts(result));
          setHasMore(
            isPaginatedSort(filtersRef.current.sortMode) &&
              rows.length >= LIBRARY_PAGE_SIZE
          );
        } catch (e) {
          if (requestId !== requestIdRef.current) return;
          if ((e as Error).name !== 'AbortError') {
            setError((e as Error).message || 'Failed to load library.');
            setData([]);
            setCounts(null);
            setHasMore(false);
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        }
      })();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      abortRef.current?.abort();
    };
  }, [key]);

  /** Fetch the next keyset page (cursor from the last accumulated row) and append it. */
  const fetchMore = useCallback(() => {
    const currentFilters = filtersRef.current;
    if (!isPaginatedSort(currentFilters.sortMode)) return;
    const currentData = dataRef.current;
    if (currentData.length === 0) return;

    const cursorRow = currentData[currentData.length - 1];
    abortMoreRef.current?.abort();
    const controller = new AbortController();
    abortMoreRef.current = controller;
    const requestId = requestIdRef.current;

    setError(null);
    setIsLoadingMore(true);

    void (async () => {
      try {
        const result = await http<GameOverviewQueryResponseDto>(
          '/api/query/game-overview',
          {
            method: 'POST',
            body: JSON.stringify(toQueryRequestBody(currentFilters, cursorRow)),
            signal: controller.signal,
          }
        );
        if (requestId !== requestIdRef.current) return;
        const rows = result.rows ?? [];
        setData((prev) => [...prev, ...rows]);
        setHasMore(rows.length >= LIBRARY_PAGE_SIZE);
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message || 'Failed to load library.');
          setHasMore(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingMore(false);
        }
      }
    })();
  }, []);

  return { data, counts, isLoading, isLoadingMore, hasMore, error, fetchMore };
}
