import type { BacklogCompletionGameOverviewDto } from '../../services/statisticsApi';

function yearFromDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const y = parseInt(dateStr.slice(0, 4), 10);
  return Number.isNaN(y) ? null : y;
}

function isInYear(dateStr: string | null, year: number): boolean {
  return yearFromDate(dateStr) === year;
}

export interface BacklogChangesByYearRow {
  year: number;
  addedToBacklog: number;
  addedFree: number;
  removedFromBacklog: number;
  finishedDate: number;
  completedDate: number;
}

/** First row per gameUid matching predicate (games with multiple instances count once). */
export function uniqueGamesByUid(
  rows: BacklogCompletionGameOverviewDto[],
  predicate: (r: BacklogCompletionGameOverviewDto) => boolean
): BacklogCompletionGameOverviewDto[] {
  const map = new Map<string, BacklogCompletionGameOverviewDto>();
  for (const r of rows) {
    if (!predicate(r)) continue;
    if (!map.has(r.gameUid)) map.set(r.gameUid, r);
  }
  return Array.from(map.values());
}

/** Count distinct games (by gameUid) matching predicate. */
export function countUniqueGames(
  rows: BacklogCompletionGameOverviewDto[],
  predicate: (r: BacklogCompletionGameOverviewDto) => boolean
): number {
  return uniqueGamesByUid(rows, predicate).length;
}

/**
 * Groups raw BacklogCompletionGameOverviewDto list by year and counts:
 * - addedToBacklog: games added to backlog in that year
 * - addedFree: of those added, count where forFree is true
 * - removedFromBacklog: games removed from backlog in that year
 * - finishedDate: games with finishedDate in that year
 * - completedDate: games with completedDate in that year
 * Each gameUid is counted at most once per metric (multiple instances = one game).
 * Years with all zero counts are excluded from the result (so they are not shown in the chart/tooltips).
 */
export function groupBacklogChangesByYear(
  rows: BacklogCompletionGameOverviewDto[],
  yearRange: number[]
): BacklogChangesByYearRow[] {
  return yearRange
    .map((year) => {
      const addedToBacklogRows = uniqueGamesByUid(rows, (r) => isInYear(r.addedToBacklog, year));
      const addedToBacklog = addedToBacklogRows.length;
      const addedFree = addedToBacklogRows.filter((r) => r.forFree).length;
      const removedFromBacklog = countUniqueGames(rows, (r) =>
        isInYear(r.removedFromBacklog, year)
      );
      const finishedDate = countUniqueGames(rows, (r) => isInYear(r.finishedDate, year));
      const completedDate = countUniqueGames(rows, (r) => isInYear(r.completedDate, year));
      return {
        year,
        addedToBacklog,
        addedFree,
        removedFromBacklog,
        finishedDate,
        completedDate,
      };
    })
    .filter(
      (row) =>
        row.addedToBacklog > 0 ||
        row.addedFree > 0 ||
        row.removedFromBacklog > 0 ||
        row.finishedDate > 0 ||
        row.completedDate > 0
    );
}

/** X-axis labels for the backlog changes bar chart. */
export const BACKLOG_CHANGES_GROUP_LABELS = [
  'Added to backlog',
  'Of those, for free',
  'Removed from backlog',
  'Finished',
  'Completed',
] as const;
