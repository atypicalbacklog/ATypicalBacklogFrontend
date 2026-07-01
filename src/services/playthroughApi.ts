import { http } from './httpClient';
import {
  CreatePlaythroughRequest,
  PlaythroughDTO,
  PlaythroughQueryResultDto,
  UpdatePlaythroughRequest,
  UpdatePlaythroughCompletionRequest,
} from '../types/dto';

const BASE = '/api/playthroughs';

export const PlaythroughApi = {
  get: (uid: string) => http<PlaythroughDTO>(`${BASE}/${uid}`),

  /** Find playthroughs by game instance UID. */
  findByGameInstance: (gameInstanceUid: string) =>
    http<PlaythroughQueryResultDto[]>(
      `/api/query/playthroughs?gameInstanceUid=${encodeURIComponent(gameInstanceUid)}`
    ),

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

  /** Combined update: playthrough metadata + game completions + DLC links + backlog (6.4). */
  updateCompletion: (uid: string, data: UpdatePlaythroughCompletionRequest) =>
    http<PlaythroughDTO>(`${BASE}/${uid}/playthrough-completion`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
