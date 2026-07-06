import { http } from './httpClient';
import type { ReduceTimeBookingDurationRequestDto, TimeBookingQueryDto } from '../types/dto';

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

/** Subtract minutes from a closed time booking's endTime. */
export function reduceTimeBookingDuration(
  body: ReduceTimeBookingDurationRequestDto
): Promise<TimeBookingQueryDto> {
  return http<TimeBookingQueryDto>('/api/time-bookings/reduce-duration', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
