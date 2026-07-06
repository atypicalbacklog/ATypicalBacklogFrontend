import type {
  BacklogRecommendationViewDto,
  UnifiedGameSearchResultDto,
  UnifiedGameSearchResultType,
} from '../../types/backlogRecommendationDto';

const RESULT_TYPE_PRIORITY: Record<UnifiedGameSearchResultType, number> = {
  BACKLOG: 1,
  GAME: 2,
  BACKLOG_RECOMMENDATION: 3,
};

/** Keep at most one result per gameUid; BACKLOG beats GAME beats BACKLOG_RECOMMENDATION. */
export function dedupeUnifiedSearchResults(
  results: UnifiedGameSearchResultDto[]
): UnifiedGameSearchResultDto[] {
  const withoutGameUid: UnifiedGameSearchResultDto[] = [];
  const byGameUid = new Map<string, UnifiedGameSearchResultDto>();

  for (const result of results) {
    if (!result.gameUid) {
      withoutGameUid.push(result);
      continue;
    }

    const existing = byGameUid.get(result.gameUid);
    if (
      !existing ||
      RESULT_TYPE_PRIORITY[result.resultType] < RESULT_TYPE_PRIORITY[existing.resultType]
    ) {
      byGameUid.set(result.gameUid, result);
    }
  }

  return [...byGameUid.values(), ...withoutGameUid].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function unifiedSearchResultDate(
  item: UnifiedGameSearchResultDto
): { date: string; tooltip: string } | null {
  if (item.releaseDate) {
    return { date: item.releaseDate, tooltip: 'Release date' };
  }
  if (item.resultType === 'BACKLOG' && item.backlogInfo?.addedDate) {
    return { date: item.backlogInfo.addedDate, tooltip: 'Since addition to backlog' };
  }
  return null;
}

/** GAME/BACKLOG rows for the unified panel (deduped per gameUid). */
export function unifiedPanelGameResults(
  results: UnifiedGameSearchResultDto[]
): UnifiedGameSearchResultDto[] {
  return dedupeUnifiedSearchResults(results).filter(
    (r) => r.resultType === 'GAME' || r.resultType === 'BACKLOG'
  );
}

/** gameUid values that already have a backlog submission (search + full list). */
export function gameUidsWithBacklogSubmission(
  rawResults: UnifiedGameSearchResultDto[],
  allItems: BacklogRecommendationViewDto[]
): Set<string> {
  const uids = new Set<string>();
  for (const r of rawResults) {
    if (r.resultType === 'BACKLOG_RECOMMENDATION' && r.gameUid) {
      uids.add(r.gameUid);
    }
  }
  for (const item of allItems) {
    if (item.gameUid) uids.add(item.gameUid);
  }
  return uids;
}

function unifiedRecommendationToViewDto(
  result: UnifiedGameSearchResultDto
): BacklogRecommendationViewDto {
  return {
    uid: result.backlogRecommendationUid!,
    creationDate: result.gameRecommendation?.creationDate ?? '',
    name: result.name,
    state: result.state ?? 'NEW',
    stateReason: result.stateReason,
    stateDate: result.stateDate ?? '',
    voteCount: result.voteCount,
    voteRank: 0,
    originalRecommendationBy: result.originalRecommendationBy,
    gameUid: result.gameUid,
    linkedGameImageUid: result.coverImageUid,
    gameRecommendation: result.gameRecommendation ?? {
      uid: '',
      creationDate: '',
      nameBase: result.name,
      releaseDate: result.releaseDate,
      externalIgdbId: null,
    },
    backlogInfo: result.backlogInfo,
    completions: result.completions,
    comments: [],
  };
}

/** All matching recommendations for the list below (not deduped away). */
export function listItemsFromSearchRecommendations(
  rawResults: UnifiedGameSearchResultDto[],
  allItems: BacklogRecommendationViewDto[]
): BacklogRecommendationViewDto[] {
  const recommendations = rawResults.filter(
    (r) => r.resultType === 'BACKLOG_RECOMMENDATION' && r.backlogRecommendationUid
  );

  return recommendations.map((r) => {
    const full = allItems.find((i) => i.uid === r.backlogRecommendationUid);
    if (!full) return unifiedRecommendationToViewDto(r);
    return {
      ...full,
      voteCount: r.voteCount,
      state: r.state ?? full.state,
      stateReason: r.stateReason ?? full.stateReason,
      stateDate: r.stateDate ?? full.stateDate,
    };
  });
}
