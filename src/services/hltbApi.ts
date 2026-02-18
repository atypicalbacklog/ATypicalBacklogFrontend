import { http } from './httpClient';

export interface HltbEstimateDto {
  uid: string;
  gameInstanceUid: string;
  mainHours: number;
  extraHours: number;
  completeHours: number;
  externalId: string | null;
  lastUpdated: string; // ISO-8601
}

export interface UpsertHltbEstimateRequest {
  uid?: string | null;
  gameInstanceUid: string;
  mainHours?: number;
  extraHours?: number;
  completeHours?: number;
  externalId?: string | null;
}

const BASE = '/api/hltb-estimates';

export const HltbApi = {
  getByGameInstance: (gameInstanceUid: string) =>
    http<HltbEstimateDto>(
      `${BASE}/game-instance/${encodeURIComponent(gameInstanceUid)}`
    ),

  upsert: (data: UpsertHltbEstimateRequest) =>
    http<HltbEstimateDto>(BASE, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
