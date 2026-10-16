import type { GameOverviewRowDto } from './types';

export interface GroupedLibraryGame {
  gameUid: string;
  gameName: string;
  rows: GameOverviewRowDto[];
}

const COMPLETION_RANK: Record<string, number> = {
  none: 0,
  cancelled: 1,
  backlog: 2,
  started: 3,
  'in progress': 4,
  postponed: 5,
  abandoned: 6,
  played: 7,
  finished: 8,
  finishedplus: 9,
  'finished plus': 9,
  completed: 10,
};

function normalizeState(name: string | null | undefined): string {
  return (name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function completionStateRank(name: string | null | undefined): number {
  const key = normalizeState(name);
  if (!key || key === 'none') return 0;
  return COMPLETION_RANK[key] ?? 0;
}

export function rowReleaseDate(row: GameOverviewRowDto): string | null {
  return row.dlcReleaseDate ?? row.instanceReleaseDate ?? row.gameReleaseDate ?? null;
}

/** DLC overview rows: prefer isDlc, fall back to dlcUid when flag is missing. */
export function isLibraryDlcRow(row: GameOverviewRowDto): boolean {
  return row.isDlc === true || (row.dlcUid != null && row.dlcUid !== '');
}

export function rowCoverUid(row: GameOverviewRowDto): string | null {
  if (isLibraryDlcRow(row)) {
    return (
      row.dlcCoverImageUid ??
      row.instanceCoverImageUid ??
      row.gameCoverImageUid ??
      row.coverImageUid
    );
  }
  return row.instanceCoverImageUid ?? row.gameCoverImageUid ?? row.coverImageUid;
}

/** Group flat library rows into one card per game. */
export function groupLibraryRows(items: GameOverviewRowDto[]): GroupedLibraryGame[] {
  const byGame = new Map<string, GroupedLibraryGame>();

  for (const row of items) {
    const existing = byGame.get(row.gameUid);
    if (existing) {
      existing.rows.push(row);
      continue;
    }
    byGame.set(row.gameUid, {
      gameUid: row.gameUid,
      gameName: row.gameName,
      rows: [row],
    });
  }

  return [...byGame.values()];
}

export function earliestReleaseDate(rows: GameOverviewRowDto[]): string | null {
  let earliest: string | null = null;
  for (const row of rows) {
    const date = rowReleaseDate(row);
    if (!date) continue;
    if (!earliest || date < earliest) earliest = date;
  }
  return earliest;
}

export interface AggregatedCompletion {
  completionStateName: string | null;
  hasActivePlaythrough: boolean;
}

export function aggregateCompletion(
  rows: GameOverviewRowDto[],
  resolveStateName: (uid: string | null) => string | null
): AggregatedCompletion {
  let bestName: string | null = null;
  let bestRank = -1;
  let hasActivePlaythrough = false;

  for (const row of rows) {
    if (isLibraryDlcRow(row)) continue;
    if (row.hasActivePlaythrough) hasActivePlaythrough = true;
    const name = resolveStateName(row.completionStateUid);
    const rank = completionStateRank(name);
    if (rank > bestRank) {
      bestRank = rank;
      bestName = name;
    }
  }

  return {
    completionStateName: bestRank > 0 ? bestName : null,
    hasActivePlaythrough,
  };
}

/** Instance rows followed by each instance's DLC rows (for flip-side list). */
export function orderedInstanceAndDlcRows(
  rows: GameOverviewRowDto[]
): GameOverviewRowDto[] {
  const instances = rows.filter((r) => !isLibraryDlcRow(r));
  const dlcs = rows.filter((r) => isLibraryDlcRow(r));
  const ordered: GameOverviewRowDto[] = [];
  const usedDlc = new Set<string>();

  for (const instance of instances) {
    ordered.push(instance);
    if (!instance.gameInstanceUid) continue;
    for (const dlc of dlcs) {
      if (dlc.gameInstanceUid !== instance.gameInstanceUid) continue;
      const key = dlc.dlcUid ?? `${dlc.gameInstanceUid}-${dlc.dlcName}`;
      if (usedDlc.has(key)) continue;
      usedDlc.add(key);
      ordered.push(dlc);
    }
  }

  for (const dlc of dlcs) {
    const key = dlc.dlcUid ?? `${dlc.gameInstanceUid}-${dlc.dlcName}`;
    if (usedDlc.has(key)) continue;
    ordered.push(dlc);
  }

  return ordered.length > 0 ? ordered : rows;
}

/** Primary instance for navigation / minimized grouped cards.
 * Priority: furthest completion → has playtime → most recently received. */
export function pickPrimaryLibraryRow(
  rows: GameOverviewRowDto[],
  resolveStateName: (uid: string | null) => string | null
): GameOverviewRowDto {
  const instances = rows.filter((r) => !isLibraryDlcRow(r));
  const pool = instances.length > 0 ? instances : rows;

  return [...pool].sort((a, b) => {
    const rankDiff =
      completionStateRank(resolveStateName(b.completionStateUid)) -
      completionStateRank(resolveStateName(a.completionStateUid));
    if (rankDiff !== 0) return rankDiff;

    const playA = a.totalPlaytimeSeconds > 0 ? 1 : 0;
    const playB = b.totalPlaytimeSeconds > 0 ? 1 : 0;
    if (playB !== playA) return playB - playA;
    if (b.totalPlaytimeSeconds !== a.totalPlaytimeSeconds) {
      return b.totalPlaytimeSeconds - a.totalPlaytimeSeconds;
    }

    const receivedA = a.instanceReceivedDate ?? '';
    const receivedB = b.instanceReceivedDate ?? '';
    return receivedB.localeCompare(receivedA);
  })[0];
}

/** Count games that have more than one instance (2+ instances on one game = 1). */
export function duplicatedInstanceCount(items: GameOverviewRowDto[]): number {
  const instanceCountByGame = new Map<string, number>();

  for (const row of items) {
    if (isLibraryDlcRow(row)) continue;
    if (!row.gameInstanceUid && !row.hasInstance) continue;
    instanceCountByGame.set(
      row.gameUid,
      (instanceCountByGame.get(row.gameUid) ?? 0) + 1
    );
  }

  let duplicates = 0;
  for (const count of instanceCountByGame.values()) {
    if (count > 1) duplicates += 1;
  }
  return duplicates;
}
