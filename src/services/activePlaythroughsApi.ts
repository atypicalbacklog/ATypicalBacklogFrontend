import { http } from './httpClient';
import { ActivePlaythroughOverviewRow } from '../types/dto';

export function fetchActivePlaythroughs() {
  return http<ActivePlaythroughOverviewRow[]>(
    '/api/query/active-playthroughs'
  );
}

export interface PlaythroughHistorySearchRequest {
  name: string | null;
  playthroughStateUid: string | null;
  playthroughTypeUid: string | null;
  year: number | null;
}

export function searchPlaythroughHistory(body: PlaythroughHistorySearchRequest) {
  return http<ActivePlaythroughOverviewRow[]>(
    '/api/query/playthroughs/history/search',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
