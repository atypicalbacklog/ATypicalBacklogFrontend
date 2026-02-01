export interface GameDTO {
  uid: string;
  name: string;
  firstReleaseDate: string; // ISO date (YYYY-MM-DD)
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

// ---------------------------------------------------------------------------
// Playthrough
// ---------------------------------------------------------------------------

export interface ActivePlaythroughOverviewRow {
  playthroughUid: string;
  gameInstanceUid: string;
  displayName: string;
  thumbnailImageUid: string | null;
  playthroughTypeUid: string;
  inputUid: string;
  playthroughStateUid: string;
  isTimeTrackingActive: boolean;
  totalPlaytimeSeconds: number;
  /** When current session started (ISO instant); present when isTimeTrackingActive. */
  currentSessionStartedAt?: string | null;
  /** When last session stopped (ISO instant); for quick access when not tracking. */
  lastStoppedAt?: string | null;
}

export interface CreatePlaythroughRequest {
  gameInstanceUid: string;
  startedAt: string; // YYYY-MM-DD
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