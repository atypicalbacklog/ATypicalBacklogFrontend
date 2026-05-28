export type SortMode =
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'PLAYTIME_DESC'
  | 'LAST_PLAYED_DESC'
  | 'NEWEST_CREATED'
  | 'RELEASE_DATE';

export type CompletionFilterIntent =
  | 'COMPLETED'
  | 'FINISHED'
  | 'PLAYING'
  | 'PLAYED'
  | 'BACKLOG'
  | 'UNPLAYED';

export interface LibraryFilterState {
  searchText: string;
  platformUids: string[];
  consoleUids: string[];
  ignorePorts: boolean;
  inBacklog: boolean | null;
  hasActivePlaythrough: boolean | null;
  completionFilterIntents: CompletionFilterIntent[];
  completionStateUids: string[];
  playthroughTypeUids: string[];
  includeDlc: boolean | null;
  onlyGamesWithDlc: boolean | null;
  sortMode: SortMode;
}

/** Single source of truth for library list rows; align with backend game-overview API. */
export interface GameOverviewRowDto {
  isDlc?: boolean;
  gameUid: string;
  gameInstanceUid: string | null;
  dlcUid?: string | null;
  hasInstance: boolean;

  gameName: string;
  gameReleaseDate: string | null;

  instanceName: string | null;
  instanceReleaseDate: string | null;
  instanceReceivedDate?: string | null;
  inPossession: boolean;

  platformUid: string | null;
  platformName: string | null;
  variantUid: string | null;
  variantName: string | null;

  gameCoverImageUid?: string | null;
  instanceCoverImageUid?: string | null;
  dlcCoverImageUid?: string | null;

  dlcName?: string | null;
  dlcReleaseDate?: string | null;

  inBacklog: boolean;
  hasActivePlaythrough: boolean;
  completionStateUid: string | null;

  totalPlaytimeSeconds: number;
  /** Fallback when separate covers not set; prefer dlcCoverImageUid when isDlc, else instanceCoverImageUid, else gameCoverImageUid. */
  coverImageUid: string | null;

  hasDlc?: boolean;
}

export interface GameOverviewQueryResponseDto {
  rows: GameOverviewRowDto[];
  gameCount: number;
  gameInstanceCount: number;
  dlcCount: number;
  returnedGameCount: number;
  returnedGameInstanceCount: number;
  returnedDlcCount: number;
}