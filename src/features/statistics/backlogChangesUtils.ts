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

/**
 * Groups raw BacklogCompletionGameOverviewDto list by year and counts:
 * - addedToBacklog: games added to backlog in that year
 * - addedFree: of those added, count where forFree is true
 * - removedFromBacklog: games removed from backlog in that year
 * - finishedDate: games with finishedDate in that year
 * - completedDate: games with completedDate in that year
 * Years with all zero counts are excluded from the result (so they are not shown in the chart/tooltips).
 */
export function groupBacklogChangesByYear(
  rows: BacklogCompletionGameOverviewDto[],
  yearRange: number[]
): BacklogChangesByYearRow[] {
  return yearRange
    .map((year) => {
      const addedToBacklogRows = rows.filter((r) => isInYear(r.addedToBacklog, year));
      const addedToBacklog = addedToBacklogRows.length;
      const addedFree = addedToBacklogRows.filter((r) => r.forFree).length;
      const removedFromBacklog = rows.filter((r) => isInYear(r.removedFromBacklog, year)).length;
      const finishedDate = rows.filter((r) => isInYear(r.finishedDate, year)).length;
      const completedDate = rows.filter((r) => isInYear(r.completedDate, year)).length;
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
