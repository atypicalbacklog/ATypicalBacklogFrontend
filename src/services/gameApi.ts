import { http } from './httpClient';
import { GameDTO, GameInstanceSummaryDto } from '../types/dto';

const BASE = '/api/games';

export const GameApi = {
  create: (data: Omit<GameDTO, 'uid'>) => http<GameDTO>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  get: (uid: string) => http<GameDTO>(`${BASE}/${uid}`),
  /** All instances for this game (for instance switcher). */
  getInstances: (gameUid: string) =>
    http<GameInstanceSummaryDto[]>(`${BASE}/${gameUid}/instances`),
  update: (uid: string, data: Omit<GameDTO, 'uid'>) =>
    http<GameDTO>(`${BASE}/${uid}`, { method: 'PUT', body: JSON.stringify(data) }),
};
