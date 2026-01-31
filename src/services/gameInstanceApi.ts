import { http } from './httpClient';
import { GameInstanceDTO } from '../types/dto';

const BASE = '/api/game-instances';

export const GameInstanceApi = {
  create: (data: Omit<GameInstanceDTO, 'uid'>) => http<GameInstanceDTO>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  get: (uid: string) => http<GameInstanceDTO>(`${BASE}/${uid}`),
  update: (uid: string, data: Omit<GameInstanceDTO, 'uid'>) =>
    http<GameInstanceDTO>(`${BASE}/${uid}`, { method: 'PUT', body: JSON.stringify(data) }),
};
