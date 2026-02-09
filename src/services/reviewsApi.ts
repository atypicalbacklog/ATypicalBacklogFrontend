import { http } from './httpClient';
import type {
  ReviewSearchResultDto,
  ReviewSearchByYearRequest,
  ReviewUpdateTierBulkRequest,
  ReviewUpdateRequest,
  ReviewByUidDto,
} from '../types/dto';

const BASE = '/api/reviews';

export const ReviewsApi = {
  getByUid: (uid: string) =>
    http<ReviewByUidDto>(`${BASE}/${encodeURIComponent(uid)}`),

  getByGameInstance: (gameInstanceUid: string) =>
    http<ReviewByUidDto[]>(`${BASE}/by-game-instance/${encodeURIComponent(gameInstanceUid)}`),

  searchByYear: (payload: ReviewSearchByYearRequest) =>
    http<ReviewSearchResultDto[]>(`${BASE}/search-by-year`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTierBulk: (payload: ReviewUpdateTierBulkRequest) =>
    http<void>(`${BASE}/update-tier-bulk`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateReview: (payload: ReviewUpdateRequest) =>
    http<void>(BASE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
