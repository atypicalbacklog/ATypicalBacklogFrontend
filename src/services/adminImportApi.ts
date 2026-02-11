import { http } from './httpClient';
import type {
  StagedGameSummaryDto,
  StagedPlaythroughGroupSummaryDto,
  StagedResolutionStatus,
} from '../types/adminImport';

const BASE = '/api/admin/import';

export const AdminImportApi = {
  /**
   * List staged games, optionally filtered by resolution status.
   * Omit status to return all.
   */
  listStagedGames: (status?: StagedResolutionStatus) => {
    const url = status ? `${BASE}/staged-games?status=${encodeURIComponent(status)}` : `${BASE}/staged-games`;
    return http<StagedGameSummaryDto[]>(url);
  },

  /**
   * List staged playthrough groups that have no staged game linked (unmapped).
   */
  listUnmappedStagedPlaythroughGroups: () =>
    http<StagedPlaythroughGroupSummaryDto[]>(`${BASE}/staged-playthrough-groups/unmapped`),
};
