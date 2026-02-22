import { useEffect, useRef, useState } from 'react';
import { http } from '../../services/httpClient';
import { GameOverviewRowDto, LibraryFilterState } from './types';

/** Map UI filter state to API request body (empty arrays → null for "no filter"). If platform is set, console filter is ignored. */
function toQueryRequestBody(f: LibraryFilterState) {
  const platformSet = f.platformUids.length > 0;
  return {
    searchText: f.searchText || null,
    platformUids: platformSet ? f.platformUids : null,
    consoleUids: platformSet ? null : (f.consoleUids.length ? f.consoleUids : null),
    inBacklog: f.inBacklog,
    hasActivePlaythrough: f.hasActivePlaythrough,
    completionStateUids: f.completionStateUids.length
      ? f.completionStateUids
      : null,
    playthroughTypeUids: f.playthroughTypeUids.length
      ? f.playthroughTypeUids
      : null,
    includeDlc: f.includeDlc,
    onlyGamesWithDlc: f.onlyGamesWithDlc,
    sortMode: f.sortMode,
  };
}

export function useLibraryQuery(filters: LibraryFilterState) {
  const [data, setData] = useState<GameOverviewRowDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setIsLoading(true);
      try {
        const result = await http<GameOverviewRowDto[]>(
          '/api/query/game-overview',
          {
            method: 'POST',
            body: JSON.stringify(toQueryRequestBody(filters)),
            signal: controller.signal,
          }
        );
        setData(result);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message || 'Failed to load library.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      abortRef.current?.abort();
    };
  }, [filters]);

  return { data, isLoading, error };
}