import { http } from './httpClient';

export interface YearlyReviewGameDto {
  uid: string;
  gameUid: string;
  gameInstanceUid: string | null;
  preferredImageUid: string | null;
  text: string | null;
  order: number;
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
  categories: YearlyReviewCategoryDto[];
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
  gameUid: string;
  gameInstanceUid: string | null;
  preferredImageUid: string | null;
  text: string | null;
  order: number;
}

const BASE = '/api/yearly-review';

export const YearlyReviewApi = {
  getByYear: (year: number) =>
    http<YearlyReviewDto>(`${BASE}?year=${year}`),

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
