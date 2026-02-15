import { http } from './httpClient';
import type {
  StagedGameDetailDto,
  StagedGameSummaryDto,
  StagedPlaythroughGroupDetailDto,
  StagedPlaythroughGroupSummaryDto,
  StagedResolutionStatus,
  UpdateStagedGameRequest,
  UpdateStagedPlaythroughGroupRequest,
} from '../types/adminImport';

const BASE = '/api/admin/import';

export const AdminImportApi = {
  /**
   * Get a staged game by UID (with linked playthrough groups).
   */
  getStagedGame: (uid: string) =>
    http<StagedGameDetailDto>(`${BASE}/staged-games/${encodeURIComponent(uid)}`),

  /**
   * Update a staged game. Only non-null fields in the request are applied.
   */
  updateStagedGame: (uid: string, data: UpdateStagedGameRequest) =>
    http<StagedGameDetailDto>(`${BASE}/staged-games/${encodeURIComponent(uid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * List staged games, optionally filtered by resolution status.
   * Omit status to return all.
   */
  listStagedGames: (status?: StagedResolutionStatus) => {
    const url = status ? `${BASE}/staged-games?status=${encodeURIComponent(status)}` : `${BASE}/staged-games`;
    return http<StagedGameSummaryDto[]>(url);
  },

  /**
   * Get counts of staged games by resolution status.
   */
  getStagedGameCountsByStatus: () =>
    http<Record<string, number>>(`${BASE}/staged-games/counts-by-resolution-status`),

  /**
   * List staged playthrough groups by mapped/unmapped.
   * @param unmapped true = only without staged game; false = only with staged game
   */
  listStagedPlaythroughGroups: (unmapped: boolean) =>
    http<StagedPlaythroughGroupSummaryDto[]>(
      `${BASE}/staged-playthrough-groups?unmapped=${unmapped}`
    ),

  /**
   * Get a staged playthrough group by UID.
   */
  getStagedPlaythroughGroup: (uid: string) =>
    http<StagedPlaythroughGroupDetailDto>(
      `${BASE}/staged-playthrough-groups/${encodeURIComponent(uid)}`
    ),

  /**
   * Update a staged playthrough group.
   */
  updateStagedPlaythroughGroup: (
    uid: string,
    data: UpdateStagedPlaythroughGroupRequest
  ) =>
    http<StagedPlaythroughGroupDetailDto>(
      `${BASE}/staged-playthrough-groups/${encodeURIComponent(uid)}`,
      { method: 'PUT', body: JSON.stringify(data) }
    ),

  /**
   * Search staged games by name (ILIKE on proposed name, matched game name, etc.).
   */
  searchStagedGames: (name: string) => {
    if (!name.trim()) return Promise.resolve([]);
    return http<StagedGameDetailDto[]>(
      `${BASE}/staged-games/search?name=${encodeURIComponent(name.trim())}`
    );
  },
};
