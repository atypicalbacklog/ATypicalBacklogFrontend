import { useCallback, useEffect, useState } from 'react';
import { initialFetchBegin, initialFetchEnd } from '../../../app/initialFetchGuard';
import {
  fetchGamePlaytimeRanking,
  type GamePlaytimeRankingDto,
} from '../../../services/statisticsApi';
import { useStatisticsFilters } from '../StatisticsFiltersContext';

export interface GamePlaytimeDisplay {
  gameUid: string;
  gameName: string; // fallback to UID if no name available
  totalHours: number;
}

export function useGamePlaytimeRanking(): {
  data: GamePlaytimeDisplay[];
  isLoading: boolean;
  error: string | null;
} {
  const { fromYear, toYear } = useStatisticsFilters();
  const [data, setData] = useState<GamePlaytimeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await fetchGamePlaytimeRanking({ fromYear, toYear });
      const display: GamePlaytimeDisplay[] = raw
        .map((r) => ({
          gameUid: r.gameUid,
          gameName: r.gameUid, // backend doesn't return name; could be resolved elsewhere
          totalHours: r.totalSeconds / 3600,
        }))
        .sort((a, b) => b.totalHours - a.totalHours);
      setData(display);
    } catch {
      setError('Failed to load game playtime ranking.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fromYear, toYear]);

  useEffect(() => {
    const key = `game-playtime-ranking-${fromYear}-${toYear}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [load, fromYear, toYear]);

  return { data, isLoading, error };
}
