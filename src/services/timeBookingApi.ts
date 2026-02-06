import { http } from './httpClient';
import type { TimeBookingQueryDto } from '../types/dto';

/**
 * Time bookings for a playthrough. Duration is computed in frontend from startTime/endTime.
 */
export function getTimeBookingsByPlaythrough(
  playthroughUid: string
): Promise<TimeBookingQueryDto[]> {
  return http<TimeBookingQueryDto[]>(
    `/api/query/time-bookings?playthroughUid=${encodeURIComponent(playthroughUid)}`
  );
}
