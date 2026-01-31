import { useEffect, useRef, useState } from 'react';
import { http } from '../../services/httpClient';
import { GameOverviewRowDto, LibraryFilterState } from './types';

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
            body: JSON.stringify(filters),
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