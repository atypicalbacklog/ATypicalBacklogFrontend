export interface GameRecommendationDto {
  uid: string;
  creationDate: string;
  nameBase: string;
  releaseDate: string | null;
  externalIgdbId: string | null;
}

export interface BacklogRecommendationCommentDto {
  uid: string;
  creationDate: string;
  comment: string;
}

export interface BacklogInfoDto {
  uid: string;
  addedDate: string;
  removedDate: string | null;
  reason: string | null;
}

export interface BacklogRecommendationCompletionDto {
  uid: string;
  gameInstanceUid: string;
  dlcUid: string | null;
  completionStateUid: string;
  info: string | null;
  finishedDate: string | null;
  completedDate: string | null;
  platformUid?: string;
  platformName?: string;
  coverImageUid?: string | null;
}

export interface BacklogRecommendationViewDto {
  uid: string;
  creationDate: string;
  name: string;
  state: string;
  stateReason: string | null;
  stateDate: string;
  voteCount: number;
  voteRank: number;
  originalRecommendationBy: string | null;
  gameUid: string | null;
  /** Primary game or instance cover when gameUid is set. */
  linkedGameImageUid: string | null;
  gameRecommendation: GameRecommendationDto;
  backlogInfo: BacklogInfoDto | null;
  completions: BacklogRecommendationCompletionDto[];
  comments: BacklogRecommendationCommentDto[];
}

export type UnifiedGameSearchResultType =
  | 'GAME'
  | 'BACKLOG'
  | 'BACKLOG_RECOMMENDATION';

export interface UnifiedGameSearchResultDto {
  resultType: UnifiedGameSearchResultType;
  name: string;
  releaseDate: string | null;
  coverImageUid: string | null;
  gameUid: string | null;
  backlogInfo: BacklogInfoDto | null;
  completions: BacklogRecommendationCompletionDto[];
  backlogRecommendationUid: string | null;
  voteCount: number;
  state: string | null;
  stateReason: string | null;
  stateDate: string | null;
  originalRecommendationBy: string | null;
  gameRecommendation: GameRecommendationDto | null;
}

export interface CreateBacklogRecommendationRequest {
  gameRecommendation: {
    uid: string | null;
    nameBase: string | null;
    releaseDate: string | null;
    externalIgdbId: string | null;
  };
  backlogRecommendation: {
    gameUid: string | null;
    name: string;
    originalRecommendationBy: string | null;
    comment: string | null;
  };
}

export interface CreateBacklogRecommendationResponse {
  backlogRecommendationUid: string;
  gameRecommendationUid: string;
}
