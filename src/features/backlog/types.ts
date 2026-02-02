/** Filter state for backlog overview; aligns with POST /api/query/backlog-overview request. */
export interface BacklogFilterState {
  searchText: string;
  consoleUids: string[];
  platformUids: string[];
  hasActivePlaythrough: boolean | null;
  completionStateUids: string[];
}

/** Single instance row within a backlog game; from backend BacklogOverviewGameDto.instances[]. */
export interface BacklogOverviewInstanceDto {
  gameInstanceUid: string;
  platformUid: string;
  platformName: string;
  originalConsoleUid: string | null;
  variantUid: string;
  instanceName: string | null;
  releaseDate: string | null;
  receivedDate: string | null;
  inPossession: boolean;
  completionStateUid: string | null;
  activePlaythroughUid: string | null;
  totalPlaytimeSeconds: number;
}

/** One backlog entry + game with instances; read model from backend. */
export interface BacklogOverviewGameDto {
  gameUid: string;
  gameName: string;
  gameReleaseDate: string | null;
  backlogUid: string;
  backlogAddedDate: string;
  backlogReason: string | null;
  backlogScore: number;
  hasAnyPlaythrough: boolean;
  hasActivePlaythrough: boolean;
  thumbnailImageUid: string | null;
  instances: BacklogOverviewInstanceDto[];
}
