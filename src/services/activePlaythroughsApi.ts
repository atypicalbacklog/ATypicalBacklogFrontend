import { http } from './httpClient';
import { ActivePlaythroughOverviewRow } from '../types/dto';

export function fetchActivePlaythroughs() {
  return http<ActivePlaythroughOverviewRow[]>(
    '/api/query/active-playthroughs'
  );
}
