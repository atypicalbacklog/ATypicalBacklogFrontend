import { http } from './httpClient';

const BASE = '/api/game-completions';

export const GameCompletionApi = {
  /** Update/create game completion for an instance; optional dlcUid for DLC completion. */
  update: (
    gameInstanceUid: string,
    completionStateUid: string,
    info: string,
    dlcUid?: string | null
  ) =>
    http<void>(BASE, {
      method: 'POST',
      body: JSON.stringify({
        gameInstanceUid,
        completionStateUid,
        dlcUid: dlcUid ?? null,
        info,
      }),
    }),
};
