import { http } from './httpClient';

export interface IgdbReleaseDateDto {
  date: string | null; // YYYY-MM-DD
  platformId: number | null;
  platformAbbreviation: string | null;
  region: number | null;
}

export interface IgdbGameSearchResultDto {
  externalId: number; // long integer (IGDB game ID)
  name: string;
  releaseDate: string | null; // YYYY-MM-DD
  coverImageUrl: string | null; // URL to cover image
  category: string | null; // from game_type.type (e.g. main_game, expansion)
  releasedPlatforms: string[]; // platform shortcuts only (e.g. PC, PS5)
  releaseDates?: IgdbReleaseDateDto[]; // from /release_dates, per platform
}

export interface ImportCoverRequest {
  externalId: number;
  ownerType: 'GAME' | 'GAME_INSTANCE' | 'DLC';
  gameUid?: string;
  gameInstanceUid?: string | null;
  dlcUid?: string | null; // required if ownerType is DLC
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

  /** Get a single IGDB game by external ID. Returns 404 when no game exists for the given ID. */
  getByExternalId: (externalId: number): Promise<IgdbGameSearchResultDto> =>
    http<IgdbGameSearchResultDto>(`${BASE}/games/${externalId}`),

  /** Get related content (DLCs, expansions, etc.) for an IGDB game. Optional name filter. */
  getRelated: (
    externalId: number,
    name?: string
  ): Promise<IgdbGameSearchResultDto[]> => {
    const params = name?.trim()
      ? `?name=${encodeURIComponent(name.trim())}`
      : '';
    return http<IgdbGameSearchResultDto[]>(
      `${BASE}/games/${externalId}/related${params}`
    );
  },

  /** Import cover image from IGDB. */
  importCover: (data: ImportCoverRequest): Promise<void> =>
    http<void>(`${BASE}/import-cover`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
