import { http } from './httpClient';
import { GameDTO, GameInstanceSummaryDto } from '../types/dto';

const BASE = '/api/games';

// Simple in-memory caches so repeated lookups for the same game/game-instances
// (e.g. from YearlyReview + edit, or multiple charts) don't re-hit the backend.
const gameCache = new Map<string, Promise<GameDTO>>();
const gameInstancesCache = new Map<string, Promise<GameInstanceSummaryDto[]>>();

export const GameApi = {
  create: (data: Omit<GameDTO, 'uid'>) =>
    http<GameDTO>(BASE, { method: 'POST', body: JSON.stringify(data) }),

  get: (uid: string) => {
    let cached = gameCache.get(uid);
    if (!cached) {
      cached = http<GameDTO>(`${BASE}/${uid}`);
      gameCache.set(uid, cached);
    }
    return cached;
  },

  /** All instances for this game (for instance switcher, stats, etc.). */
  getInstances: (gameUid: string) => {
    let cached = gameInstancesCache.get(gameUid);
    if (!cached) {
      cached = http<GameInstanceSummaryDto[]>(`${BASE}/${gameUid}/instances`);
      gameInstancesCache.set(gameUid, cached);
    }
    return cached;
  },

  update: (uid: string, data: Omit<GameDTO, 'uid'>) =>
    http<GameDTO>(`${BASE}/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((updated) => {
      // Keep caches in sync for the updated game.
      gameCache.set(uid, Promise.resolve(updated));
      return updated;
    }),
};
