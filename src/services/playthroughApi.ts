import { http } from './httpClient';
import {
  CreatePlaythroughRequest,
  PlaythroughDTO,
  UpdatePlaythroughRequest,
} from '../types/dto';

const BASE = '/api/playthroughs';

export const PlaythroughApi = {
  get: (uid: string) => http<PlaythroughDTO>(`${BASE}/${uid}`),

  create: (data: CreatePlaythroughRequest) =>
    http<PlaythroughDTO>(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (uid: string, data: UpdatePlaythroughRequest) =>
    http<PlaythroughDTO>(`${BASE}/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
