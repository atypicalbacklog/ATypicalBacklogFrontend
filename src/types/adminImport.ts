/** Resolution status for staged import entities. */
export type StagedResolutionStatus =
  | 'CREATED'
  | 'UPDATED'
  | 'CURATED'
  | 'FINALIZED'
  | 'IMPORTED';

/** Summary of a staged game (list by status). */
export interface StagedGameSummaryDto {
  uid: string;
  proposedName: string;
  resolutionStatus: StagedResolutionStatus;
}

/** Summary of a staged playthrough group (e.g. unmapped list). */
export interface StagedPlaythroughGroupSummaryDto {
  uid: string;
  name: string | null;
  importedName: string | null;
  importBatchUid: string;
  stagedGameUid: string | null;
  inferredTypeUid: string | null;
  inferredYear: number | null;
  proposedPlaythroughStateUid: string | null;
  resolutionStatus: string;
}

/** Playthrough group as returned inside StagedGameDetailDto. */
export interface StagedPlaythroughGroupInDetailDto {
  uid: string;
  importBatchUid: string;
  stagedGameUid: string | null;
  importedName: string | null;
  inferredTypeUid: string | null;
  inferredYear: number | null;
  proposedPlaythroughStateUid: string | null;
  resolutionStatus: string;
}

/** Full staged game with linked playthrough groups. */
export interface StagedGameDetailDto {
  uid: string;
  importBatchUid: string;
  proposedName: string;
  proposedReleaseDate: string | null;
  proposedReceivedDate: string | null;
  proposedVariantUid: string | null;
  proposedPlatformUid: string | null;
  matchedGameUid: string | null;
  matchedExternalIgdbId: string | null;
  matchedOriginalConsoleUid: string | null;
  proposedCompletionStateUid: string | null;
  backlogStartDate: string | null;
  backlogEndDate: string | null;
  backlogReason: string | null;
  matchedGameInstanceUid: string | null;
  resolutionStatus: StagedResolutionStatus;
  playthroughGroups: StagedPlaythroughGroupInDetailDto[];
}

/** Request body for updating a staged game (all optional). */
export interface UpdateStagedGameRequest {
  proposedName?: string | null;
  proposedReleaseDate?: string | null;
  proposedReceivedDate?: string | null;
  proposedVariantUid?: string | null;
  proposedPlatformUid?: string | null;
  matchedGameUid?: string | null;
  matchedGameInstanceUid?: string | null;
  matchedExternalIgdbId?: string | null;
  matchedOriginalConsoleUid?: string | null;
  proposedCompletionStateUid?: string | null;
  backlogStartDate?: string | null;
  backlogEndDate?: string | null;
  backlogReason?: string | null;
  resolutionStatus?: 'UPDATED' | 'CURATED' | 'FINALIZED' | null;
}

/** Full staged playthrough group (get by uid). */
export interface StagedPlaythroughGroupDetailDto {
  uid: string;
  importBatchUid: string;
  stagedGameUid: string | null;
  /** Display name (API may return importedPlaythroughName or importedName). */
  importedPlaythroughName?: string | null;
  importedName?: string | null;
  inferredTypeUid: string | null;
  inferredYear: number | null;
  proposedPlaythroughStateUid: string | null;
  resolutionStatus: StagedResolutionStatus;
}

/** Request body for updating a staged playthrough group (all optional). */
export interface UpdateStagedPlaythroughGroupRequest {
  stagedGameUid?: string | null;
  importedName?: string | null;
  inferredTypeUid?: string | null;
  inferredYear?: number | null;
  proposedPlaythroughStateUid?: string | null;
  resolutionStatus?: 'UPDATED' | 'CURATED' | 'FINALIZED' | null;
}
