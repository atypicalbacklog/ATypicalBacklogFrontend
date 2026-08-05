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

function queryKey(f: LibraryFilterState): string {
  return JSON.stringify(toQueryRequestBody(f));
}

export function useLibraryQuery(filters: LibraryFilterState) {
  const [data, setData] = useState<GameOverviewRowDto[]>([]);
  const [counts, setCounts] = useState<Omit<GameOverviewQueryResponseDto, 'rows'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const key = queryKey(filters);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

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
          if (requestId !== requestIdRef.current) return;
          if ((e as Error).name !== 'AbortError') {
            setError((e as Error).message || 'Failed to load library.');
            setData([]);
            setCounts(null);
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

  return { data, counts, isLoading, error };
}
