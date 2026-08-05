import { useEffect, useRef, useState } from 'react';
import { fetchBacklogOverview } from '../../services/backlogOverviewApi';
import type {
  BacklogFilterState,
  BacklogOverviewGameDto,
} from './types';

const DEBOUNCE_MS = 300;

export function useBacklogQuery(filters: BacklogFilterState) {
  const [data, setData] = useState<BacklogOverviewGameDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

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

      setError(null);
      setIsLoading(true);
      // Clear immediately so the list never shows a previous filter's results.
      setData([]);

      void (async () => {
        try {
          const result = await fetchBacklogOverview(filters, controller.signal);
          if (requestId !== requestIdRef.current) return;
          setData(result);
        } catch (e) {
          if (requestId !== requestIdRef.current) return;
          if ((e as Error).name !== 'AbortError') {
            setError((e as Error).message || 'Failed to load backlog.');
            setData([]);
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

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
