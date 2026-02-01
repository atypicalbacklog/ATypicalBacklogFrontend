import { http } from './httpClient';
import type { GameOverviewRowDto } from '../features/library/types';

/** Lightweight search for game instances (uses game-overview query). */
export function searchGameOverview(searchText: string) {
  return http<GameOverviewRowDto[]>('/api/query/game-overview', {
    method: 'POST',
    body: JSON.stringify({
      searchText: searchText || null,
      platformUids: null,
      consoleUids: null,
      inBacklog: null,
      hasActivePlaythrough: null,
      completionStateUids: null,
      sortMode: 'NAME_ASC',
    }),
  });
}
