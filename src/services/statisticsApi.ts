import { http } from './httpClient';

const BASE = '/api/stats';

/** Backend DTO: GET /api/stats/yearly-activity */
export interface YearlyActivityDto {
  year: number;
  totalSeconds: number;
  activeDays: number;
  bookingCount: number;
  distinctGames: number;
  completionCount: number;
}

/** Backend DTO: GET /api/stats/console-year-activity */
export interface ConsoleYearActivityDto {
  year: number;
  consoleUid: string;
  totalSeconds: number;
  distinctGames: number;
  /** Optional: when backend provides booking count per console/year */
  bookingCount: number;
}

/** Backend DTO: GET /api/stats/variant-year-activity */
export interface VariantYearActivityDto {
  year: number;
  variantUid: string;
  totalSeconds: number;
}

/** Backend DTO: GET /api/stats/monthly-playtime */
export interface MonthlyPlaytimeDto {
  year: number;
  month: number;
  totalSeconds: number;
}

/** Backend DTO: GET /api/stats/weekly-playtime */
export interface WeeklyPlaytimeDto {
  year: number;
  week: number;
  totalSeconds: number;
}

/** Backend DTO: GET /api/stats/weekday-playtime */
export interface WeekdayPlaytimeDto {
  year: number;
  weekday: number;
  totalSeconds: number;
}

/** Backend DTO: GET /api/stats/console-inputstyle-playtime */
export interface ConsoleInputStyleDto {
  year: number;
  consoleUid: string;
  inputUid: string;
  totalSeconds: number;
}

/** Backend DTO: GET /api/stats/game-playtime-ranking */
export interface GamePlaytimeRankingDto {
  gameUid: string;
  totalSeconds: number;
}

/** Backend DTO: GET /api/stats/booking-duration-distribution (array element) */
export interface BookingDurationBucketDto {
  durationMinutes: number;
  bookingCount: number;
}

function queryString(params: Record<string, number | string | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export function fetchYearlyActivity(signal?: AbortSignal): Promise<YearlyActivityDto[]> {
  return http<YearlyActivityDto[]>(`${BASE}/yearly-activity`, { signal });
}

export function fetchConsoleYearActivity(
  year: number,
  signal?: AbortSignal
): Promise<ConsoleYearActivityDto[]> {
  return http<ConsoleYearActivityDto[]>(
    `${BASE}/console-year-activity${queryString({ year })}`,
    { signal }
  );
}

export function fetchVariantYearActivity(
  year: number,
  signal?: AbortSignal
): Promise<VariantYearActivityDto[]> {
  return http<VariantYearActivityDto[]>(
    `${BASE}/variant-year-activity${queryString({ year })}`,
    { signal }
  );
}

export function fetchMonthlyPlaytime(
  year: number,
  signal?: AbortSignal
): Promise<MonthlyPlaytimeDto[]> {
  return http<MonthlyPlaytimeDto[]>(
    `${BASE}/monthly-playtime${queryString({ year })}`,
    { signal }
  );
}

export function fetchWeeklyPlaytime(
  year: number,
  signal?: AbortSignal
): Promise<WeeklyPlaytimeDto[]> {
  return http<WeeklyPlaytimeDto[]>(
    `${BASE}/weekly-playtime${queryString({ year })}`,
    { signal }
  );
}

export function fetchWeekdayPlaytime(
  year: number,
  signal?: AbortSignal
): Promise<WeekdayPlaytimeDto[]> {
  return http<WeekdayPlaytimeDto[]>(
    `${BASE}/weekday-playtime${queryString({ year })}`,
    { signal }
  );
}

export function fetchConsoleInputStylePlaytime(
  year: number,
  signal?: AbortSignal
): Promise<ConsoleInputStyleDto[]> {
  return http<ConsoleInputStyleDto[]>(
    `${BASE}/console-inputstyle-playtime${queryString({ year })}`,
    { signal }
  );
}

export function fetchGamePlaytimeRanking(
  params: { fromYear?: number; toYear?: number },
  signal?: AbortSignal
): Promise<GamePlaytimeRankingDto[]> {
  return http<GamePlaytimeRankingDto[]>(
    `${BASE}/game-playtime-ranking${queryString(params)}`,
    { signal }
  );
}

export function fetchBookingDurationDistribution(
  params: { gameUid: string; fromYear?: number; toYear?: number },
  signal?: AbortSignal
): Promise<BookingDurationBucketDto[]> {
  return http<BookingDurationBucketDto[]>(
    `${BASE}/booking-duration-distribution${queryString(params)}`,
    { signal }
  );
}
