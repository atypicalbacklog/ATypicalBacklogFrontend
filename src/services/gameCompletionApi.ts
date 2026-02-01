import { http } from './httpClient';

const BASE = '/api/game-completions';

export const GameCompletionApi = {
  /** Update/create game completion for an instance. */
  update: (
    gameInstanceUid: string,
    completionStateUid: string,
    info: string
  ) =>
    http<void>(BASE, {
      method: 'POST',
      body: JSON.stringify({
        gameInstanceUid,
        completionStateUid,
        info,
      }),
    }),
};
