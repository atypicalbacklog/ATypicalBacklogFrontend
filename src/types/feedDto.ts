import type { BacklogOverviewGameDto } from '../features/backlog/types';
import type { GameOverviewRowDto } from '../features/library/types';
import type { ReviewPresentationType } from './dto';

export interface PublicGameFeedRowDto {
  gameUid: string;
  gameInstanceUid: string | null;
  imageUid: string | null;
  name: string;
  overview: GameOverviewRowDto;
}

export type RecentActivityCategory =
  | 'BACKLOG_RECENT'
  | 'ENDED_PLAYTHROUGH'
  | 'RECENT_COMPLETION'
  | 'RECENT_PLAY';

export interface RecentActivityFeedItemDto {
  category: RecentActivityCategory;
  row: PublicGameFeedRowDto;
}

export interface RecentActivityFeedRequest {
  totalCount: number;
  maxPerCategory: number;
}

export interface RandomBacklogFeedRequest {
  count: number;
}

export interface PublicSTierReviewFeedItemDto {
  gameUid: string;
  gameInstanceUid: string;
  imageUid: string | null;
  name: string;
  overview: GameOverviewRowDto;
  reviewUid: string;
  reviewDate: string | null;
  tierUid: string;
  reviewText: string | null;
  preferredImageUid: string | null;
  presentationType: ReviewPresentationType | string;
  playthroughUid: string;
}

export interface RandomSTierReviewFeedRequest {
  count: number;
}

export interface PublicGameRecommendationDto {
  uid: string;
  creationDate: string;
  nameBase: string;
  releaseDate: string | null;
  externalIgdbId: string | null;
}

export interface PublicRandomBacklogRecommendationFeedItemDto {
  backlogRecommendationUid: string;
  name: string;
  state: string;
  stateReason: string | null;
  stateDate: string;
  voteCount: number;
  voteRank: number;
  gameUid: string | null;
  gameInstanceUid: string | null;
  imageUid: string | null;
  overview: GameOverviewRowDto | null;
  gameRecommendation: PublicGameRecommendationDto | null;
}

export interface RandomBacklogRecommendationFeedRequest {
  count: number;
}

export type { BacklogOverviewGameDto };
