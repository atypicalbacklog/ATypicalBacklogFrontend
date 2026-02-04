import { http } from './httpClient';
import type { GameQueryResultDto } from '../types/dto';

export function searchGames(query: string): Promise<GameQueryResultDto[]> {
  if (!query.trim()) return Promise.resolve([]);
  return http<GameQueryResultDto[]>(
    `/api/query/games?q=${encodeURIComponent(query.trim())}`
  );
}
