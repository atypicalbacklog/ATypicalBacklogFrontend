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
  importedName: string | null;
  importBatchUid: string;
  stagedGameUid: string | null;
  inferredTypeUid: string | null;
  inferredYear: number | null;
  proposedPlaythroughStateUid: string | null;
  resolutionStatus: string;
}
