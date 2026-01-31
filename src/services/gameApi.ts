import { http } from './httpClient';
import { GameDTO } from '../types/dto';

const BASE = '/api/games';

export const GameApi = {
  create: (data: Omit<GameDTO, 'uid'>) => http<GameDTO>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  get: (uid: string) => http<GameDTO>(`${BASE}/${uid}`),
  update: (uid: string, data: Omit<GameDTO, 'uid'>) =>
    http<GameDTO>(`${BASE}/${uid}`, { method: 'PUT', body: JSON.stringify(data) }),
};
