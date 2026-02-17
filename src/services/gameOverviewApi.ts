import { http } from './httpClient';
import type { GameOverviewRowDto } from '../features/library/types';

export interface GameOverviewQueryPayload {
  searchText?: string | null;
  platformUids?: string[] | null;
  consoleUids?: string[] | null;
  inBacklog?: boolean | null;
  hasActivePlaythrough?: boolean | null;
  completionStateUids?: string[] | null;
  playthroughTypeUids?: string[] | null;
  includeDlc?: boolean | null;
  onlyGamesWithDlc?: boolean | null;
  sortMode?: string;
}

/** Game overview query (library, filters, sort). */
export function queryGameOverview(payload: GameOverviewQueryPayload) {
  return http<GameOverviewRowDto[]>('/api/query/game-overview', {
    method: 'POST',
    body: JSON.stringify({
      searchText: payload.searchText ?? null,
      platformUids: payload.platformUids ?? null,
      consoleUids: payload.consoleUids ?? null,
      inBacklog: payload.inBacklog ?? null,
      hasActivePlaythrough: payload.hasActivePlaythrough ?? null,
      completionStateUids: payload.completionStateUids ?? null,
      playthroughTypeUids: payload.playthroughTypeUids ?? null,
      includeDlc: payload.includeDlc ?? null,
      onlyGamesWithDlc: payload.onlyGamesWithDlc ?? null,
      sortMode: payload.sortMode ?? 'NAME_ASC',
    }),
  });
}

/** Lightweight search for game instances (uses game-overview query). */
export function searchGameOverview(searchText: string) {
  return queryGameOverview({
    searchText: searchText || null,
    platformUids: null,
    consoleUids: null,
    inBacklog: null,
    hasActivePlaythrough: null,
    completionStateUids: null,
    playthroughTypeUids: null,
    includeDlc: null,
    onlyGamesWithDlc: null,
    sortMode: 'NAME_ASC',
  });
}

/** Search for game instances only (no DLC rows); for "Add Playthrough". */
export function searchGameOverviewForPlaythrough(searchText: string) {
  return queryGameOverview({
    searchText: searchText || null,
    platformUids: null,
    consoleUids: null,
    inBacklog: null,
    hasActivePlaythrough: null,
    completionStateUids: null,
    playthroughTypeUids: null,
    includeDlc: false,
    onlyGamesWithDlc: null,
    sortMode: 'NAME_ASC',
  });
}
