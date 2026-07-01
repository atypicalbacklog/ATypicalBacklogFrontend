import { http } from './httpClient';
import {
  CreateGameInstanceRequest,
  UpdateGameInstanceRequest,
  GameInstanceDTO,
  GameInstanceDetailDTO,
} from '../types/dto';

const BASE = '/api/game-instances';

// In-memory cache so repeated lookups for the same instance uid
// (e.g. from YearlyReview cards, detail/overview pages) share a single request.
const instanceCache = new Map<string, Promise<GameInstanceDetailDTO>>();

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
    }).then((updated) => {
      // After update, invalidate detail cache for this instance.
      instanceCache.delete(uid);
      return updated;
    }),

  get: (uid: string) => {
    let cached = instanceCache.get(uid);
    if (!cached) {
      cached = http<GameInstanceDetailDTO>(`${BASE}/${uid}`);
      instanceCache.set(uid, cached);
    }
    return cached;
  },

  /** Drop cached detail so the next get() hits the API (e.g. after DLC/completion changes). */
  invalidateCache: (uid: string) => {
    instanceCache.delete(uid);
  },
};
