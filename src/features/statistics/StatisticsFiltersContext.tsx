import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface StatisticsFiltersState {
  fromYear: number;
  toYear: number;
}

const currentYear = new Date().getFullYear();
export const STATS_MIN_YEAR = 2017;
export const STATS_LAST_YEAR = currentYear - 1; // "last year" for "from" max
export const STATS_CURRENT_YEAR = currentYear;

const defaultFilters: StatisticsFiltersState = {
  fromYear: currentYear - 4, // 4 years in the past by default
  toYear: currentYear, // current year by default
};

interface StatisticsFiltersContextValue extends StatisticsFiltersState {
  setFromYear: (year: number) => void;
  setToYear: (year: number) => void;
  setYearRange: (from: number, to: number) => void;
  yearRange: number[];
}

const StatisticsFiltersContext = createContext<StatisticsFiltersContextValue | undefined>(undefined);

export function StatisticsFiltersProvider({ children }: { children: React.ReactNode }) {
  const [fromYear, setFromYearState] = useState(defaultFilters.fromYear);
  const [toYear, setToYearState] = useState(defaultFilters.toYear);

  const setFromYear = useCallback((year: number) => {
    setFromYearState((prev) => {
      const clamped = Math.max(STATS_MIN_YEAR, Math.min(STATS_LAST_YEAR, year));
      if (clamped > toYear) return prev;
      return clamped;
    });
  }, [toYear]);

  const setToYear = useCallback((year: number) => {
    setToYearState((prev) => {
      const clamped = Math.max(STATS_MIN_YEAR, Math.min(STATS_CURRENT_YEAR, year));
      if (clamped < fromYear) return prev;
      return clamped;
    });
  }, [fromYear]);

  const setYearRange = useCallback((from: number, to: number) => {
    if (from <= to) {
      setFromYearState(from);
      setToYearState(to);
    }
  }, []);

  const yearRange = useMemo(() => {
    const arr: number[] = [];
    for (let y = fromYear; y <= toYear; y++) arr.push(y);
    return arr;
  }, [fromYear, toYear]);

  const value = useMemo<StatisticsFiltersContextValue>(
    () => ({
      fromYear,
      toYear,
      setFromYear,
      setToYear,
      setYearRange,
      yearRange,
    }),
    [fromYear, toYear, setFromYear, setToYear, setYearRange, yearRange]
  );

  return (
    <StatisticsFiltersContext.Provider value={value}>
      {children}
    </StatisticsFiltersContext.Provider>
  );
}

export function useStatisticsFilters() {
  const ctx = useContext(StatisticsFiltersContext);
  if (!ctx) {
    throw new Error('useStatisticsFilters must be used within StatisticsFiltersProvider');
  }
  return ctx;
}
