import { http } from './httpClient';

/** Request for POST /api/dlcs. */
export interface CreateDlcRequest {
  gameInstanceUid: string;
  name: string;
  receivedDate: string | null; // YYYY-MM-DD
  releaseDate: string; // YYYY-MM-DD; required on creation
  playthroughUid: string | null;
  /** Optional; when omitted, backend uses "None" state. */
  completionStateUid?: string | null;
  /** Optional; info text for game_completion. */
  info?: string | null;
}

/** Response from create DLC and from get-by-game-instance. */
export interface DlcDto {
  uid: string;
  gameInstanceUid: string;
  name: string;
  receivedDate: string | null; // YYYY-MM-DD
  releaseDate?: string | null; // YYYY-MM-DD
  playthroughUid: string | null;
  completionStateUid?: string | null;
}

/** Request for PUT /api/dlcs/{uid}. */
export interface UpdateDlcRequest {
  name?: string;
  receivedDate?: string | null;
  releaseDate?: string | null;
  completionStateUid?: string | null;
  /** Link DLC to this playthrough. */
  playthroughUid?: string | null;
  /** If true and no playthroughUid given, sets playthroughUid to null (unlink). */
  removePreviousPlaythrough?: boolean | null;
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

  update: (uid: string, data: UpdateDlcRequest) =>
    http<DlcDto>(`${BASE}/${encodeURIComponent(uid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
