import { http } from './httpClient';

/** Request for POST /api/dlcs. */
export interface CreateDlcRequest {
  gameInstanceUid: string;
  name: string;
  receivedDate: string | null; // YYYY-MM-DD
  playthroughUid: string | null;
}

/** Response from create DLC and from get-by-game-instance. */
export interface DlcDto {
  uid: string;
  gameInstanceUid: string;
  name: string;
  receivedDate: string | null; // YYYY-MM-DD
  playthroughUid: string | null;
}

const BASE = '/api/dlcs';

export const DlcApi = {
  create: (data: CreateDlcRequest) =>
    http<DlcDto>(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByGameInstance: (gameInstanceUid: string) =>
    http<DlcDto[]>(`${BASE}/by-game-instance/${encodeURIComponent(gameInstanceUid)}`),
};
