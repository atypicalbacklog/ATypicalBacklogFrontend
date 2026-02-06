import { http } from './httpClient';
import {
  TimeBookingStartDTO,
  TimeBookingStopDTO,
  TimeBookingRetroactiveDTO,
} from '../types/dto';

export const PlaySessionApi = {
  start: (playthroughUid: string) =>
    http<TimeBookingStartDTO>(`/api/playthroughs/${playthroughUid}/sessions/start`, {
      method: 'POST',
    }),
  stop: (playthroughUid: string) =>
    http<TimeBookingStopDTO>(`/api/playthroughs/${playthroughUid}/sessions/stop`, {
      method: 'POST',
    }),
  /** Create retroactive time booking (date at noon + minuteCount). minuteCount 1–600. */
  retroactive: (playthroughUid: string, body: { date: string; minuteCount: number }) =>
    http<TimeBookingRetroactiveDTO>(
      `/api/playthroughs/${playthroughUid}/sessions/retroactive`,
      { method: 'POST', body: JSON.stringify(body) }
    ),
};
