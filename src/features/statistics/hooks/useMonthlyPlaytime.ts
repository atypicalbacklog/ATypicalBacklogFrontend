import { useCallback, useEffect, useState } from 'react';
import { initialFetchBegin, initialFetchEnd } from '../../../app/initialFetchGuard';
import { fetchMonthlyPlaytime } from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';

export interface MonthlyPlaytimeDisplay {
  year: number;
  month: number;
  totalHours: number;
  label: string; // e.g. "2023-01"
}

export function useMonthlyPlaytime(): {
  data: MonthlyPlaytimeDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { yearRange } = useStatisticsFilters();
  const [data, setData] = useState<MonthlyPlaytimeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all: MonthlyPlaytimeDisplay[] = [];
      for (const year of yearRange) {
        const raw = await fetchMonthlyPlaytime(year);
        for (const r of raw) {
          all.push({
            year: r.year,
            month: r.month,
            totalHours: r.totalSeconds / 3600,
            label: `${r.year}-${String(r.month).padStart(2, '0')}`,
          });
        }
      }
      all.sort((a, b) => a.year - b.year || a.month - b.month);
      setData(all);
    } catch {
      setError('Failed to load monthly playtime.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [yearRange]);

  useEffect(() => {
    const key = `monthly-playtime-${yearRange.join(',')}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [load, yearRange]);

  return { data, isLoading, error };
}
