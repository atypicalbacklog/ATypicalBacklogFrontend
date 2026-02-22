import { http } from './httpClient';

const BASE = '/api/game-completions';

export const GameCompletionApi = {
  /** Update/create game completion for an instance; optional dlcUid for DLC completion. */
  update: (
    gameInstanceUid: string,
    completionStateUid: string,
    info: string,
    dlcUid?: string | null,
    dates?: { finishedDate?: string | null; completedDate?: string | null }
  ) =>
    http<void>(BASE, {
      method: 'POST',
      body: JSON.stringify({
        gameInstanceUid,
        completionStateUid,
        dlcUid: dlcUid ?? null,
        info,
        ...(dates?.finishedDate != null && { finishedDate: dates.finishedDate }),
        ...(dates?.completedDate != null && { completedDate: dates.completedDate }),
      }),
    }),
};
