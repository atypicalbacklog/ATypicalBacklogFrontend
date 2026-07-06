import { useEffect, useRef, useState } from 'react';
import { http } from '../../services/httpClient';
import { GameOverviewQueryResponseDto, GameOverviewRowDto, LibraryFilterState } from './types';

/** Map UI filter state to API request body (empty arrays → null for "no filter"). If platform is set, console filter is ignored. */
function toQueryRequestBody(f: LibraryFilterState) {
  const platformSet = f.platformUids.length > 0;
  return {
    searchText: f.searchText || null,
    platformUids: platformSet ? f.platformUids : null,
    consoleUids: platformSet ? null : (f.consoleUids.length ? f.consoleUids : null),
    ignorePorts: f.ignorePorts,
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
  const [counts, setCounts] = useState<Omit<GameOverviewQueryResponseDto, 'rows'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    let cancelled = false;

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const body = toQueryRequestBody(filters);

      setError(null);
      setIsLoading(true);

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
          if (cancelled) return;
          setData(result.rows ?? []);
          setCounts({
            gameCount: result.gameCount ?? 0,
            gameInstanceCount: result.gameInstanceCount ?? 0,
            dlcCount: result.dlcCount ?? 0,
            returnedGameCount: result.returnedGameCount ?? 0,
            returnedGameInstanceCount: result.returnedGameInstanceCount ?? 0,
            returnedDlcCount: result.returnedDlcCount ?? 0,
          });
        } catch (e) {
          if (cancelled) return;
          if ((e as Error).name !== 'AbortError') {
            setError((e as Error).message || 'Failed to load library.');
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      abortRef.current?.abort();
    };
  }, [filters]);

  return { data, counts, isLoading, error };
}
