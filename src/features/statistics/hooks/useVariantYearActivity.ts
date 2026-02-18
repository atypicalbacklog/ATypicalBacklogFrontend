import { useCallback, useEffect, useState } from 'react';
import {
  fetchVariantYearActivity,
  type VariantYearActivityDto,
} from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';
import { useReferenceData } from '../../../referenceData/ReferenceDataContext';

export interface VariantYearDisplay {
  year: number;
  variantUid: string;
  variantName: string;
  totalHours: number;
}

export function useVariantYearActivity(): {
  data: VariantYearDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { yearRange } = useStatisticsFilters();
  const { referenceData } = useReferenceData();
  const [data, setData] = useState<VariantYearDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!referenceData) return;
    setIsLoading(true);
    setError(null);
    try {
      const all: VariantYearDisplay[] = [];
      const variantMap = new Map(referenceData.data.variants.map((v) => [v.uid, v.name]));
      for (const year of yearRange) {
        const raw = await fetchVariantYearActivity(year);
        for (const r of raw) {
          all.push({
            year: r.year,
            variantUid: r.variantUid,
            variantName: variantMap.get(r.variantUid) ?? r.variantUid,
            totalHours: r.totalSeconds / 3600,
          });
        }
      }
      setData(all);
    } catch {
      setError('Failed to load variant year activity.');
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
