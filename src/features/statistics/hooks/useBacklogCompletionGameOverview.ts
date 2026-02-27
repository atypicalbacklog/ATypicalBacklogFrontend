import { useCallback, useEffect, useState } from 'react';
import { initialFetchBegin, initialFetchEnd } from '../../../app/initialFetchGuard';
import { fetchBacklogCompletionGameOverview } from '../../../services/statisticsApi';
import type { BacklogCompletionGameOverviewDto } from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';

export function useBacklogCompletionGameOverview(): {
  data: BacklogCompletionGameOverviewDto[];
  isLoading: boolean;
  error: string | null;
} {
  const { yearRange } = useStatisticsFilters();
  const [data, setData] = useState<BacklogCompletionGameOverviewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all: BacklogCompletionGameOverviewDto[] = [];
      for (const year of yearRange) {
        const raw = await fetchBacklogCompletionGameOverview(year);
        all.push(...raw);
      }
      setData(all);
    } catch {
      setError('Failed to load backlog completion overview.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [yearRange]);

  useEffect(() => {
    const key = `backlog-completion-game-overview-${yearRange.join(',')}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [load, yearRange]);

  return { data, isLoading, error };
}
