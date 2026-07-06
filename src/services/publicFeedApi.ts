import { http } from './httpClient';
import type {
  BacklogOverviewGameDto,
  PublicRandomBacklogRecommendationFeedItemDto,
  PublicSTierReviewFeedItemDto,
  RandomBacklogFeedRequest,
  RandomBacklogRecommendationFeedRequest,
  RandomSTierReviewFeedRequest,
  RecentActivityFeedItemDto,
  RecentActivityFeedRequest,
} from '../types/feedDto';

export function fetchRecentActivityFeed(
  body: RecentActivityFeedRequest
): Promise<RecentActivityFeedItemDto[]> {
  return http<RecentActivityFeedItemDto[]>('/api/feed/recent-activity', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchRandomBacklogFeed(
  body: RandomBacklogFeedRequest
): Promise<BacklogOverviewGameDto[]> {
  return http<BacklogOverviewGameDto[]>('/api/feed/random-backlog', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchRandomSTierReviewFeed(
  body: RandomSTierReviewFeedRequest
): Promise<PublicSTierReviewFeedItemDto[]> {
  return http<PublicSTierReviewFeedItemDto[]>('/api/feed/random-s-tier-reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchRandomBacklogRecommendationFeed(
  body: RandomBacklogRecommendationFeedRequest
): Promise<PublicRandomBacklogRecommendationFeedItemDto[]> {
  return http<PublicRandomBacklogRecommendationFeedItemDto[]>(
    '/api/feed/random-backlog-recommendations',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
