import { http } from './httpClient';

const BASE = '/api/backlog';

export const BacklogApi = {
  add: (gameUid: string, addedDate: string, reason: string) =>
    http<void>(BASE, {
      method: 'POST',
      body: JSON.stringify({ gameUid, addedDate, reason }),
    }),

  remove: (gameUid: string, removedDate: string) =>
    http<void>(`${BASE}/${gameUid}/remove`, {
      method: 'POST',
      body: JSON.stringify({ removedDate }),
    }),

  updateReason: (backlogEntryUid: string, reason: string) =>
    http<void>(`${BASE}/${backlogEntryUid}/reason`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
};
