/** Filter state for backlog overview; aligns with POST /api/query/backlog-overview request. */
export interface BacklogFilterState {
  searchText: string;
  consoleUids: string[];
  platformUids: string[];
  hasActivePlaythrough: boolean | null;
  completionStateUids: string[];
}

/** Playthrough summary within a backlog instance; from backend BacklogOverviewGameDto.instances[].playthroughs[]. */
export interface BacklogOverviewPlaythroughDto {
  playthroughTypeUid: string | null;
  playthroughStateUid: string | null;
  startedAt: string | null;
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
  coverImageUid: string | null;
  playthroughs: BacklogOverviewPlaythroughDto[];
  dlcNames: string[];
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
  coverImageUid: string | null;
  instances: BacklogOverviewInstanceDto[];
}
