// Shared filter DTOs

export type YearRangeDto = {
    /** Inclusive start year, e.g. 2020 */
    fromYear: number;
    /** Inclusive end year, e.g. 2025 */
    toYear: number;
  };
  
  export type StatisticsBaseFilterDto = {
    /** Optional: limit to specific consoles */
    consoleUids?: string[] | null;
    /** Optional: limit to specific platforms */
    platformUids?: string[] | null;
  };
  
  export type YearRangeStatisticsFilterDto = YearRangeDto & StatisticsBaseFilterDto;
  
  export type SingleYearConsoleFilterDto = {
    year: number;
    consoleUid: string;
  };
  
  export type GameStatisticsFilterDto = {
    /** Game or game-instance identifier, depending on your domain */
    gameUid: string;
    /** Optional: limit to bookings in a year range */
    fromYear?: number | null;
    toYear?: number | null;
  };
  
  // --- Yearly activity ---
  
  export type YearlyActivityStatsDto = {
    year: number;
    /** Sum of playtime in hours across the whole year */
    totalHours: number;
    /** Number of distinct calendar days that have at least one booking */
    bookingDays: number;
    /** Total number of individual bookings */
    bookingCount: number;
    /** Number of distinct games played */
    distinctGames: number;
    /** Number of backlog completions / state changes to "completed" */
    backlogCompletions: number;
  };
  
  // --- Console x Year ---
  
  export type ConsoleYearActivityStatsDto = {
    year: number;
    consoleUid: string;
    consoleName: string;
    /** Sum of playtime in hours for this console in this year */
    totalHours: number;
    bookingDays: number;
    bookingCount: number;
    distinctGames: number;
  };
  
  // --- Variant x Year ---
  
  export type VariantYearActivityStatsDto = {
    year: number;
    variantUid: string;
    variantName: string;
    /** Sum of playtime in hours for this variant in this year */
    totalHours: number;
  };
  
  // --- Month x Year ---
  
  export type MonthlyPlaytimeStatsDto = {
    year: number;
    /** 1–12 */
    month: number;
    /** Sum of playtime in hours for this month */
    totalHours: number;
  };
  
  // --- Week x Year ---
  
  export type WeeklyPlaytimeStatsDto = {
    year: number;
    /** ISO week-of-year, e.g. 1–53 */
    isoWeek: number;
    totalHours: number;
  };
  
  // --- Weekday x Year ---
  
  export type WeekdayPlaytimeStatsDto = {
    year: number;
    /** 0 = Monday (or 0 = Sunday, choose and document consistently) */
    weekday: number;
    /** Total hours on this weekday in that year */
    totalHours: number;
  };
  
  // --- Input style per console for a year ---
  
  export type InputStylePlaytimeStatsDto = {
    inputStyleUid: string;
    inputStyleName: string;
    /** Total hours for this input style for the given console and year */
    totalHours: number;
  };
  
  // --- Hours per game (ranking) ---
  
  export type GamePlaytimeStatsDto = {
    gameUid: string;
    gameName: string;
    /** Optional: main platform/console for display */
    consoleUid?: string | null;
    consoleName?: string | null;
    /** Sum of playtime in hours in the requested range */
    totalHours: number;
  };
  
  // --- Booking duration distribution for a game ---
  
  export type BookingDurationBucketDto = {
    /** Start of bucket in minutes, inclusive */
    fromMinutes: number;
    /** End of bucket in minutes, exclusive (or null for "and above") */
    toMinutes: number | null;
    /** Number of bookings whose duration falls into this bucket */
    bookingCount: number;
    /** Total hours across bookings in this bucket (optional but nice to have) */
    totalHours: number;
  };
  
  export type BookingDurationDistributionDto = {
    gameUid: string;
    buckets: BookingDurationBucketDto[];
  };