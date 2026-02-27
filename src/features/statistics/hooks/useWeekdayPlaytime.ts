import { useCallback, useEffect, useState } from 'react';
import { initialFetchBegin, initialFetchEnd } from '../../../app/initialFetchGuard';
import { fetchWeekdayPlaytime } from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';

/** weekday: 0 = Monday … 6 = Sunday (backend contract) */
export interface WeekdayPlaytimeDisplay {
  year: number;
  weekday: number;
  totalHours: number;
  weekdayName: string;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function useWeekdayPlaytime(): {
  data: WeekdayPlaytimeDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { yearRange } = useStatisticsFilters();
  const [data, setData] = useState<WeekdayPlaytimeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all: WeekdayPlaytimeDisplay[] = [];
      for (const year of yearRange) {
        const raw = await fetchWeekdayPlaytime(year);
        for (const r of raw) {
          all.push({
            year: r.year,
            weekday: r.weekday,
            totalHours: r.totalSeconds / 3600,
            weekdayName: WEEKDAY_NAMES[r.weekday] ?? `Day ${r.weekday}`,
          });
        }
      }
      setData(all);
    } catch {
      setError('Failed to load weekday playtime.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [yearRange]);

  useEffect(() => {
    const key = `weekday-playtime-${yearRange.join(',')}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [load, yearRange]);

  return { data, isLoading, error };
}

export { WEEKDAY_NAMES };
