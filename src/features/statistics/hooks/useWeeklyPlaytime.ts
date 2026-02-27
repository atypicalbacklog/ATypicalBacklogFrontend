import { useCallback, useEffect, useState } from 'react';
import { initialFetchBegin, initialFetchEnd } from '../../../app/initialFetchGuard';
import {
  fetchWeeklyPlaytime,
  type WeeklyPlaytimeDto,
} from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';

export interface WeeklyPlaytimeDisplay {
  year: number;
  week: number;
  totalHours: number;
  label: string; // e.g. "2023-W12"
}

export function useWeeklyPlaytime(): {
  data: WeeklyPlaytimeDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { yearRange } = useStatisticsFilters();
  const [data, setData] = useState<WeeklyPlaytimeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all: WeeklyPlaytimeDisplay[] = [];
      for (const year of yearRange) {
        const raw = await fetchWeeklyPlaytime(year);
        for (const r of raw) {
          all.push({
            year: r.year,
            week: r.week,
            totalHours: r.totalSeconds / 3600,
            label: `${r.year}-W${String(r.week).padStart(2, '0')}`,
          });
        }
      }
      all.sort((a, b) => a.year - b.year || a.week - b.week);
      setData(all);
    } catch {
      setError('Failed to load weekly playtime.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [yearRange]);

  useEffect(() => {
    const key = `weekly-playtime-${yearRange.join(',')}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [load, yearRange]);

  return { data, isLoading, error };
}
