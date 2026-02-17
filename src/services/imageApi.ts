import { http } from './httpClient';

/** Image metadata from list endpoints (17.2, 17.3). */
export interface ImageMetadataDto {
  uid: string;
  creationDate: string; // ISO-8601
  ownerType: 'GAME' | 'GAME_INSTANCE' | 'DLC';
  gameUid: string | null;
  gameInstanceUid: string | null;
  dlcUid: string | null;
  type: 'COVER' | 'SCREENSHOT' | 'ARTWORK' | 'OTHER';
  aspectHint: 'VERTICAL' | 'HORIZONTAL' | 'SQUARE' | 'FREE';
  source: 'MANUAL' | 'AI' | 'IMPORT';
  primaryImage: boolean;
  filename: string;
  mimetype: string;
}

/** Request body for PUT /api/images/{uid} (17.4). */
export interface UpdateImageMetadataRequest {
  ownerType?: 'GAME' | 'GAME_INSTANCE' | 'DLC';
  gameUid?: string | null;
  gameInstanceUid?: string | null;
  dlcUid?: string | null;
  type?: 'COVER' | 'SCREENSHOT' | 'ARTWORK' | 'OTHER';
  aspectHint?: 'VERTICAL' | 'HORIZONTAL' | 'SQUARE' | 'FREE';
  primaryImage?: boolean;
}

const BASE = '/api/images';

export const ImageApi = {
  listByGame: (gameUid: string) =>
    http<ImageMetadataDto[]>(`${BASE}/game/${encodeURIComponent(gameUid)}`),

  listByGameInstance: (gameInstanceUid: string) =>
    http<ImageMetadataDto[]>(`${BASE}/game-instance/${encodeURIComponent(gameInstanceUid)}`),

  updateMetadata: (uid: string, data: UpdateImageMetadataRequest) =>
    http<void>(`${BASE}/${encodeURIComponent(uid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uid: string) =>
    http<void>(`${BASE}/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
    }),

  /**
   * Upload a new image (17.5).
   * multipart/form-data: file (required), ownerType, gameUid?, gameInstanceUid?, type, aspectHint, source.
   */
  upload: async (formData: FormData): Promise<void> => {
    const res = await fetch(BASE, {
      method: 'POST',
      body: formData,
      // Do not set Content-Type so browser sets multipart/form-data with boundary
    });
    if (!res.ok) throw new Error('HTTP error');
  },
};

/**
 * Get image URL for a given image UID.
 * @param imageUid Image UID (can be null)
 * @param thumbnail If true, requests thumbnail; if false, requests original
 * @returns Image URL or null if imageUid is null
 */
export function getImageUrl(
  imageUid: string | null,
  thumbnail: boolean
): string | null {
  if (!imageUid) return null;
  return `/api/images/${imageUid}?thumbnail=${thumbnail}`;
}
