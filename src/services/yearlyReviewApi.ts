import { http } from './httpClient';
import type { YearlyReviewGamePresentationType } from '../types/dto';

export interface YearlyReviewGameDto {
  uid: string;
  /** Null when the entry is an additional-image stand-in. */
  gameUid: string | null;
  gameInstanceUid: string | null;
  preferredImageUid: string | null;
  /** Stand-alone image (no game link). Mutually exclusive with gameUid in practice. */
  additionalImageUid: string | null;
  text: string | null;
  order: number;
  presentationType: YearlyReviewGamePresentationType;
}

export interface YearlyReviewCategoryDto {
  uid: string;
  name: string;
  order: number;
  games: YearlyReviewGameDto[];
}

export interface YearlyReviewDto {
  uid: string;
  year: number;
  valid: boolean;
  introText?: string | null;
  outroText?: string | null;
  categories: YearlyReviewCategoryDto[];
}

export interface UpdateYearlyReviewRequest {
  introText?: string | null;
  outroText?: string | null;
}

export interface UpsertYearlyReviewCategoryRequest {
  uid?: string | null;
  yearlyReviewUid: string;
  name: string;
  order: number;
}

export interface UpsertYearlyReviewGameRequest {
  uid?: string | null;
  categoryUid: string;
  /** Null when using additionalImageUid as a stand-in. */
  gameUid: string | null;
  gameInstanceUid: string | null;
  preferredImageUid: string | null;
  additionalImageUid?: string | null;
  text: string | null;
  order: number;
  presentationType?: YearlyReviewGamePresentationType | null;
}

const BASE = '/api/yearly-review';

export const YearlyReviewApi = {
  getByYear: (year: number) =>
    http<YearlyReviewDto>(`${BASE}?year=${year}`),

  update: (uid: string, data: UpdateYearlyReviewRequest) =>
    http<void>(`${BASE}/${encodeURIComponent(uid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  upsertCategory: (data: UpsertYearlyReviewCategoryRequest) =>
    http<void>(`${BASE}/category`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  upsertGame: (data: UpsertYearlyReviewGameRequest) =>
    http<void>(`${BASE}/game`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  invalidateCategory: (uid: string) =>
    http<boolean>(`${BASE}/category/${encodeURIComponent(uid)}/invalidate`, {
      method: 'POST',
    }),

  invalidateGame: (uid: string) =>
    http<boolean>(`${BASE}/game/${encodeURIComponent(uid)}/invalidate`, {
      method: 'POST',
    }),
};
