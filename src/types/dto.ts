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
  receivedDate?: string; // ISO date (YYYY-MM-DD)
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