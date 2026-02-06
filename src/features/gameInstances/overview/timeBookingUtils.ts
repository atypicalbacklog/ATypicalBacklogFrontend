import type { TimeBookingQueryDto } from '../../../types/dto';

/**
 * Parse ISO instant to ms (UTC). Handles Z-suffix and optional offset.
 */
function parseIsoToMs(iso: string | null): number {
  if (!iso) return 0;
  return new Date(iso).getTime();
}

/**
 * Duration of a time booking in seconds. Open bookings (endTime null) use now as end.
 */
export function timeBookingDurationSeconds(
  b: TimeBookingQueryDto,
  nowMs: number = Date.now()
): number {
  const start = parseIsoToMs(b.startTime);
  const end = b.endTime ? parseIsoToMs(b.endTime) : nowMs;
  if (start <= 0) return 0;
  return Math.max(0, Math.floor((end - start) / 1000));
}

/**
 * Total seconds from multiple time bookings.
 */
export function totalDurationSeconds(
  bookings: TimeBookingQueryDto[],
  nowMs: number = Date.now()
): number {
  return bookings.reduce(
    (sum, b) => sum + timeBookingDurationSeconds(b, nowMs),
    0
  );
}
