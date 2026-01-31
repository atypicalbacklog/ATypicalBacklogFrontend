import { http } from './httpClient';
import { TimeBookingStartDTO, TimeBookingStopDTO } from '../types/dto';

export const PlaySessionApi = {
  start: (playthroughUid: string) =>
    http<TimeBookingStartDTO>(`/api/playthroughs/${playthroughUid}/sessions/start`, { method: 'POST' }),
  stop: (playthroughUid: string) =>
    http<TimeBookingStopDTO>(`/api/playthroughs/${playthroughUid}/sessions/stop`, { method: 'POST' }),
};
