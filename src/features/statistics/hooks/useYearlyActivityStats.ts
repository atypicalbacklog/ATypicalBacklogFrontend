import { useCallback, useEffect, useState } from 'react';
import { fetchYearlyActivity, type YearlyActivityDto } from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';

export interface YearlyActivityDisplay {
  year: number;
  totalHours: number;
  activeDays: number;
  bookingCount: number;
  distinctGames: number;
  completionCount: number;
}

function toDisplay(d: YearlyActivityDto): YearlyActivityDisplay {
  return {
    year: d.year,
    totalHours: d.totalSeconds / 3600,
    activeDays: d.activeDays,
    bookingCount: d.bookingCount,
    distinctGames: d.distinctGames,
    completionCount: d.completionCount,
  };
}

export function useYearlyActivityStats(): {
  data: YearlyActivityDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { fromYear, toYear } = useStatisticsFilters();
  const [data, setData] = useState<YearlyActivityDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await fetchYearlyActivity();
      const filtered = raw
        .filter((r) => r.year >= fromYear && r.year <= toYear)
        .sort((a, b) => a.year - b.year)
        .map(toDisplay);
      setData(filtered);
    } catch {
      setError('Failed to load yearly activity.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fromYear, toYear]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}
