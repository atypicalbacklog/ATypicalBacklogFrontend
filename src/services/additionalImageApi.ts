import { http } from './httpClient';

export type AdditionalImageType = 'COVER' | 'SCREENSHOT' | 'ARTWORK' | 'OTHER';
export type AdditionalImageAspectHint = 'VERTICAL' | 'HORIZONTAL' | 'SQUARE' | 'FREE';
export type AdditionalImageSource = 'MANUAL' | 'AI' | 'IMPORT';

/** Metadata from GET /api/additional-images (26.2). */
export interface AdditionalImageMetadataDto {
  uid: string;
  creationDate: string;
  type: AdditionalImageType;
  aspectHint: AdditionalImageAspectHint;
  source: AdditionalImageSource;
  filename: string;
  mimetype: string;
}

export interface PageResponseDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UpdateAdditionalImageMetadataRequest {
  type?: AdditionalImageType;
  aspectHint?: AdditionalImageAspectHint;
  source?: AdditionalImageSource;
}

const BASE = '/api/additional-images';

export function getAdditionalImageUrl(
  imageUid: string | null,
  thumbnail: boolean
): string | null {
  if (!imageUid) return null;
  return `${BASE}/${encodeURIComponent(imageUid)}?thumbnail=${thumbnail}`;
}

export const AdditionalImageApi = {
  list: (page = 0, size = 30) =>
    http<PageResponseDto<AdditionalImageMetadataDto>>(
      `${BASE}?page=${page}&size=${size}`
    ),

  updateMetadata: (uid: string, data: UpdateAdditionalImageMetadataRequest) =>
    http<void>(`${BASE}/${encodeURIComponent(uid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uid: string) =>
    http<void>(`${BASE}/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
    }),

  upload: async (formData: FormData): Promise<{ uid: string }> => {
    const res = await fetch(BASE, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('HTTP error');
    const text = await res.text();
    return (text ? JSON.parse(text) : { uid: '' }) as { uid: string };
  },
};
