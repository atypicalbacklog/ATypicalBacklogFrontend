import { http } from './httpClient';
import {
  CreateGameInstanceRequest,
  UpdateGameInstanceRequest,
  GameInstanceDTO,
  GameInstanceDetailDTO,
} from '../types/dto';

const BASE = '/api/game-instances';

export const GameInstanceApi = {
  create: (data: CreateGameInstanceRequest) =>
    http<GameInstanceDTO>(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (uid: string, data: UpdateGameInstanceRequest) =>
    http<GameInstanceDTO>(`${BASE}/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  get: (uid: string) =>
    http<GameInstanceDetailDTO>(`${BASE}/${uid}`),
};
