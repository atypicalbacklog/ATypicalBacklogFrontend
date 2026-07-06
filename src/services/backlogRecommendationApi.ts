import { http } from './httpClient';
import type {
  BacklogRecommendationViewDto,
  CreateBacklogRecommendationRequest,
  CreateBacklogRecommendationResponse,
  UnifiedGameSearchResultDto,
} from '../types/backlogRecommendationDto';

const BASE = '/api/backlog-recommendations';

export function fetchBacklogRecommendations(): Promise<BacklogRecommendationViewDto[]> {
  return http<BacklogRecommendationViewDto[]>(BASE);
}

export function fetchBacklogRecommendation(
  uid: string
): Promise<BacklogRecommendationViewDto> {
  return http<BacklogRecommendationViewDto>(`${BASE}/${uid}`);
}

export function createBacklogRecommendation(
  body: CreateBacklogRecommendationRequest
): Promise<CreateBacklogRecommendationResponse> {
  return http<CreateBacklogRecommendationResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function upvoteBacklogRecommendation(uid: string): Promise<void> {
  return http<void>(`${BASE}/${uid}/upvote`, { method: 'POST' });
}

export function addBacklogRecommendationComment(
  uid: string,
  comment: string
): Promise<void> {
  return http<void>(`${BASE}/${uid}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export function searchUnifiedGames(
  query: string
): Promise<UnifiedGameSearchResultDto[]> {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  return http<UnifiedGameSearchResultDto[]>(
    `/api/query/games/unified?q=${encodeURIComponent(q)}`
  );
}
