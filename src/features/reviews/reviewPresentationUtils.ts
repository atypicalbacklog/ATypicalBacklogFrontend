import type {
  ReviewPresentationType,
  ReviewSearchPlaythroughDto,
  ReviewSearchResultDto,
} from '../../types/dto';

/** Type priority for picking primary review playthrough: Solo > Coop > Multiplayer > Casual > other. */
const EDIT_TYPE_ORDER = ['Solo', 'Coop', 'Multiplayer', 'Casual'];

export function pickPrimaryReviewPlaythrough(
  playthroughs: ReviewSearchPlaythroughDto[],
  playthroughTypeName: (uid: string | null) => string
): ReviewSearchPlaythroughDto | undefined {
  const withReview = playthroughs.filter((p) => p.reviewUid);
  if (withReview.length === 0) return undefined;
  const typeOrderIndex = (p: ReviewSearchPlaythroughDto) => {
    const name = playthroughTypeName(p.playthroughTypeUid);
    const i = EDIT_TYPE_ORDER.findIndex((t) => t.toLowerCase() === name.toLowerCase());
    return i >= 0 ? i : EDIT_TYPE_ORDER.length;
  };
  withReview.sort((a, b) => typeOrderIndex(a) - typeOrderIndex(b));
  return withReview[0];
}

export function normalizeReviewPresentationType(
  value: ReviewPresentationType | string | null | undefined
): ReviewPresentationType {
  const upper = (value ?? 'DEFAULT').toString().toUpperCase();
  if (upper === 'UPDATED' || upper === 'REPEAT' || upper === 'REPLACED') return upper;
  return 'DEFAULT';
}

export const REVIEW_PRESENTATION_OPTIONS: { value: ReviewPresentationType; label: string }[] = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'UPDATED', label: 'Updated' },
  { value: 'REPEAT', label: 'Repeat' },
  { value: 'REPLACED', label: 'Replaced' },
];

/** Tier card native tooltip: display name plus presentation hint for REPEAT/REPLACED only. */
export function reviewCardTooltip(
  displayName: string,
  presentationType: ReviewPresentationType | string | null | undefined
): string {
  const type = normalizeReviewPresentationType(presentationType);
  if (type === 'REPEAT') return `${displayName}\nRepeated from previous year`;
  if (type === 'REPLACED') return `${displayName}\nReplacing prior review with new tier`;
  return displayName;
}

export function yearFromReviewDate(reviewDate: string | null | undefined): number | null {
  if (!reviewDate || reviewDate.length < 4) return null;
  const year = Number.parseInt(reviewDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

/** Prefer page context year; otherwise latest year from playthrough review dates. */
export function reviewYearFromCard(
  card: ReviewSearchResultDto,
  contextYear?: number | null
): number | null {
  if (contextYear != null && !Number.isNaN(contextYear)) return contextYear;
  const years = card.playthroughs
    .map((p) => yearFromReviewDate(p.reviewDate))
    .filter((y): y is number => y != null);
  if (years.length === 0) return null;
  return Math.max(...years);
}

/** Presentation used for tier-card visuals (primary review playthrough when present). */
export function reviewCardPresentationType(
  card: ReviewSearchResultDto
): ReviewPresentationType {
  const fromReview =
    card.playthroughs.find((p) => p.reviewUid)?.presentationType ??
    card.playthroughs.find((p) => p.presentationType)?.presentationType;
  return normalizeReviewPresentationType(fromReview);
}

/**
 * Within a tier: A–Z by display name, with REPEAT presentation cards after all others
 * (non-repeat A–Z, then repeat A–Z).
 */
export function compareTierlistCardsByName(
  a: ReviewSearchResultDto,
  b: ReviewSearchResultDto
): number {
  const aRepeat = reviewCardPresentationType(a) === 'REPEAT' ? 1 : 0;
  const bRepeat = reviewCardPresentationType(b) === 'REPEAT' ? 1 : 0;
  if (aRepeat !== bRepeat) return aRepeat - bRepeat;
  return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
}

export function sortTierlistCardsByName(
  cards: ReviewSearchResultDto[]
): ReviewSearchResultDto[] {
  return [...cards].sort(compareTierlistCardsByName);
}
