export interface GameDTO {
  uid: string;
  name: string;
  firstReleaseDate: string; // ISO date (YYYY-MM-DD)
  coverImageUid: string | null;
}

export interface GameInstanceDTO {
  uid: string;
  gameUid: string;
  platformUid: string;
  variantUid: string;

  name: string | null;
  releaseDate: string | null;
  originalConsoleUid: string | null;
  receivedDate: string | null;

  forFree: boolean;
  inPossession: boolean;
}

export interface BacklogEntryDTO {
  uid: string;
  addedDate: string; // YYYY-MM-DD
  removedDate: string | null; // YYYY-MM-DD
  reason: string;
}

export interface GameCompletionDTO {
  uid: string;
  gameInstanceUid: string;
  dlcUid: string | null;
  completionStateUid: string;
  info: string | null;
}

/** Summary of a game instance (e.g. for instance switcher by game). */
export interface GameInstanceSummaryDto {
  uid: string;
  name: string | null;
  coverImageUid: string | null;
}

/** Game instance detail response (includes cover, backlog entries + completions). */
export interface GameInstanceDetailDTO extends GameInstanceDTO {
  coverImageUid: string | null;
  /** All backlog entries for this game (current + history), newest first. */
  backlogEntries: BacklogEntryDTO[];
  completions: GameCompletionDTO[];
}

export interface CreateGameInstanceRequest {
  gameUid: string;
  platformUid: string;
  variantUid: string;

  name?: string | null;
  releaseDate?: string | null;
  originalConsoleUid?: string | null;
  receivedDate?: string | null;

  forFree?: boolean | null;
  inPossession?: boolean | null;
}

export interface UpdateGameInstanceRequest {
  /** When set, relinks this instance to another game. */
  gameUid?: string | null;
  platformUid?: string | null;
  variantUid?: string | null;

  name?: string | null;
  releaseDate?: string | null;
  originalConsoleUid?: string | null;
  receivedDate?: string | null;

  forFree?: boolean | null;
  inPossession?: boolean | null;
}

export interface TimeBookingStartDTO {
  timeBookingUid: string;
  startedAt: string; // ISO instant
}

export interface TimeBookingStopDTO {
  timeBookingUid: string;
  startedAt: string | null;
  stoppedAt: string | null;
  durationSeconds: number;
}

export interface TimeBookingRetroactiveDTO {
  timeBookingUid: string;
  startedAt: string; // ISO instant
  stoppedAt: string; // ISO instant
  durationSeconds: number;
}

// ---------------------------------------------------------------------------
// Playthrough
// ---------------------------------------------------------------------------

export interface ActivePlaythroughOverviewRow {
  playthroughUid: string;
  gameInstanceUid: string;
  displayName: string;
  coverImageUid: string | null;
  playthroughTypeUid: string;
  inputUid: string;
  playthroughStateUid: string;
  isTimeTrackingActive: boolean;
  /** Start of current (open) time booking when isTimeTrackingActive (ISO instant). */
  activeSessionStartedAt?: string | null;
  totalPlaytimeSeconds: number;
}

export interface CreatePlaythroughRequest {
  gameInstanceUid: string;
  startedAt: string; // YYYY-MM-DD
  playthroughTypeUid?: string; // optional
}

export interface PlaythroughDTO {
  uid: string;
  gameInstanceUid: string;
  playthroughTypeUid: string;
  inputUid: string;
  startedAt: string; // YYYY-MM-DD
  playthroughStateUid: string;
}

export interface UpdatePlaythroughRequest {
  playthroughTypeUid: string;
  inputUid: string;
  startedAt: string; // YYYY-MM-DD
  playthroughStateUid: string;
}

// ---------------------------------------------------------------------------
// Query results (search / list)
// ---------------------------------------------------------------------------

export interface GameQueryResultDto {
  gameUid: string;
  name: string;
  releaseDate: string | null;
  coverImageUid: string | null;
}

export interface GameInstanceQueryResultDto {
  gameInstanceUid: string;
  name: string;
  platformUid: string;
  coverImageUid: string | null;
}

export interface PlaythroughQueryResultDto {
  playthroughUid: string;
  playthroughStateUid: string;
  playthroughTypeUid: string;
  inputUid: string | null;
  startedAt: string; // YYYY-MM-DD
}

/** Time booking from query; duration computed in frontend from startTime/endTime. */
export interface TimeBookingQueryDto {
  uid: string;
  creationDate: string; // ISO instant
  playthroughUid: string;
  startTime: string | null; // ISO instant
  endTime: string | null; // ISO instant; null if still open
}