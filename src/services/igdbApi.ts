import { http } from './httpClient';

export interface IgdbGameSearchResultDto {
  externalId: number; // long integer (IGDB game ID)
  name: string;
  releaseDate: string | null; // YYYY-MM-DD
  coverImageUrl: string | null; // URL to cover image
  category: string | null; // from game_type.type (e.g. main_game, expansion)
  releasedPlatforms: string[]; // platform shortcuts only (e.g. PC, PS5)
}

export interface ImportCoverRequest {
  externalId: number;
  ownerType: 'GAME' | 'GAME_INSTANCE';
  gameUid?: string; // required if ownerType is GAME
  gameInstanceUid?: string | null; // required if ownerType is GAME_INSTANCE
}

const BASE = '/api/external/igdb';

export const IgdbApi = {
  /** Search IGDB games by name. */
  search: (name: string): Promise<IgdbGameSearchResultDto[]> => {
    if (!name.trim()) return Promise.resolve([]);
    return http<IgdbGameSearchResultDto[]>(
      `${BASE}/search?name=${encodeURIComponent(name.trim())}`
    );
  },

  /** Import cover image from IGDB. */
  importCover: (data: ImportCoverRequest): Promise<void> =>
    http<void>(`${BASE}/import-cover`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
