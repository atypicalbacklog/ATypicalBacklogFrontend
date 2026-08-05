import type {
  BacklogRecommendationCompletionDto,
  BacklogRecommendationViewDto,
  UnifiedGameSearchResultDto,
} from '../../types/backlogRecommendationDto';

function firstCompletionCover(
  completions: BacklogRecommendationCompletionDto[] | undefined
): string | null {
  if (!completions?.length) return null;
  for (const c of completions) {
    if (c.coverImageUid) return c.coverImageUid;
  }
  return null;
}

export function recommendationCoverUid(
  item: Pick<BacklogRecommendationViewDto, 'linkedGameImageUid' | 'completions'>
): string | null {
  if (item.linkedGameImageUid) return item.linkedGameImageUid;
  return firstCompletionCover(item.completions);
}

/** IGDB cover URL when no linked game / instance image is available. */
export function recommendationIgdbCoverUrl(
  item: Pick<BacklogRecommendationViewDto, 'gameRecommendation'>
): string | null {
  return item.gameRecommendation?.externalIgdbIdImageURL ?? null;
}

/** @deprecated Use recommendationCoverUid */
export const recommendationListCoverUid = recommendationCoverUid;

export function unifiedSearchCoverUid(
  item: Pick<UnifiedGameSearchResultDto, 'coverImageUid' | 'completions'>
): string | null {
  return item.coverImageUid ?? firstCompletionCover(item.completions);
}
