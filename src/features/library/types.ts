export type SortMode =
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'PLAYTIME_DESC'
  | 'LAST_PLAYED_DESC';

export interface LibraryFilterState {
  searchText: string;
  platformUids: string[];
  consoleUids: string[];
  inBacklog: boolean | null;
  hasActivePlaythrough: boolean | null;
  completionStateUids: string[];
  sortMode: SortMode;
}

/** Single source of truth for library list rows; align with backend game-overview API. */
export interface GameOverviewRowDto {
  gameUid: string;
  gameInstanceUid: string | null;
  hasInstance: boolean;
  gameName: string;
  releaseYear: number | null;
  platformUid: string;
  platformName: string;
  variantUid: string;
  variantName: string;
  inBacklog: boolean;
  hasActivePlaythrough: boolean;
  completionStateUid: string | null;
  totalPlaytimeSeconds: number;
  thumbnailImageUid: string | null;
}
