import { http } from './httpClient';
import type { GameInstanceQueryResultDto } from '../types/dto';

export function searchGameInstances(
  query: string
): Promise<GameInstanceQueryResultDto[]> {
  if (!query.trim()) return Promise.resolve([]);
  return http<GameInstanceQueryResultDto[]>(
    `/api/query/game-instances?q=${encodeURIComponent(query.trim())}`
  );
}
