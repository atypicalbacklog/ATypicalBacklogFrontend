import { useCallback, useEffect, useState } from 'react';
import {
  fetchConsoleYearActivity,
  type ConsoleYearActivityDto,
} from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';
import { useReferenceData } from '../../../referenceData/ReferenceDataContext';

export interface ConsoleYearDisplay {
  year: number;
  consoleUid: string;
  consoleName: string;
  totalHours: number;
  distinctGames: number;
  /** Set when backend returns bookingCount per console/year */
  bookingCount: number;
}

export function useConsoleYearActivity(): {
  data: ConsoleYearDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { yearRange } = useStatisticsFilters();
  const { referenceData } = useReferenceData();
  const [data, setData] = useState<ConsoleYearDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!referenceData) return;
    setIsLoading(true);
    setError(null);
    try {
      const all: ConsoleYearDisplay[] = [];
      const consoleMap = new Map(referenceData.data.consoles.map((c) => [c.uid, c.name]));
      for (const year of yearRange) {
        const raw = await fetchConsoleYearActivity(year);
        for (const r of raw) {
          all.push({
            year: r.year,
            consoleUid: r.consoleUid,
            consoleName: consoleMap.get(r.consoleUid) ?? r.consoleUid,
            totalHours: r.totalSeconds / 3600,
            distinctGames: r.distinctGames,
            bookingCount: r.bookingCount,
          });
        }
      }
      setData(all);
    } catch {
      setError('Failed to load console year activity.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [yearRange, referenceData]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}
