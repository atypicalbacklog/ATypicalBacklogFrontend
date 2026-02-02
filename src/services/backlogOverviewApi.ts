import { http } from './httpClient';
import type {
  BacklogFilterState,
  BacklogOverviewGameDto,
} from '../features/backlog/types';

/** Request body for POST /api/query/backlog-overview. */
function toRequestBody(f: BacklogFilterState) {
  return {
    searchText: f.searchText || null,
    consoleUids: f.consoleUids.length ? f.consoleUids : null,
    platformUids: f.platformUids.length ? f.platformUids : null,
    hasActivePlaythrough: f.hasActivePlaythrough,
    completionStateUids: f.completionStateUids.length
      ? f.completionStateUids
      : null,
  };
}

export function fetchBacklogOverview(
  filters: BacklogFilterState,
  signal?: AbortSignal
): Promise<BacklogOverviewGameDto[]> {
  return http<BacklogOverviewGameDto[]>('/api/query/backlog-overview', {
    method: 'POST',
    body: JSON.stringify(toRequestBody(filters)),
    signal,
  });
}
