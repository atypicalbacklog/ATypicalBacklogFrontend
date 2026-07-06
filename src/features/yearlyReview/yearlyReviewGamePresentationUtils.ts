import type { YearlyReviewGamePresentationType } from '../../types/dto';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';

export function normalizeYearlyReviewGamePresentationType(
  value: YearlyReviewGamePresentationType | string | null | undefined
): YearlyReviewGamePresentationType {
  const upper = (value ?? 'DEFAULT').toString().toUpperCase();
  if (upper === 'IMAGE_LEFT' || upper === 'IMAGE_RIGHT') return upper;
  return 'DEFAULT';
}

export function isSideImagePresentation(
  value: YearlyReviewGamePresentationType | string | null | undefined
): boolean {
  const type = normalizeYearlyReviewGamePresentationType(value);
  return type === 'IMAGE_LEFT' || type === 'IMAGE_RIGHT';
}

/** Matches default category game card dimensions (MUI `spacing={2}` gap = 16px). */
export const YEARLY_REVIEW_DEFAULT_CARD_WIDTH = 200;
export const YEARLY_REVIEW_DEFAULT_CARD_HEIGHT = 330;
export const YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT = 100;
export const YEARLY_REVIEW_DEFAULT_CARD_HEIGHT_COMPACT = 180;
export const YEARLY_REVIEW_CATEGORY_GAME_GAP = 16;
export const YEARLY_REVIEW_CATEGORY_GAME_GAP_COMPACT = 8;

/** Image area height in default vertical cards (card height minus text strip). */
export const YEARLY_REVIEW_SIDE_IMAGE_HEIGHT =
  YEARLY_REVIEW_DEFAULT_CARD_HEIGHT - 40;
export const YEARLY_REVIEW_SIDE_IMAGE_HEIGHT_COMPACT =
  YEARLY_REVIEW_DEFAULT_CARD_HEIGHT_COMPACT - 32;

/** Max image width when side-layout text exceeds 250 characters. */
export const YEARLY_REVIEW_SIDE_IMAGE_MAX_WIDTH = 220;
export const YEARLY_REVIEW_SIDE_IMAGE_MAX_WIDTH_COMPACT = 110;

export type YearlyReviewSideSegmentCount = 2 | 3 | 4;

/**
 * Side-layout width = N default game segments + (N−1) gaps between them.
 * >250 → 2 segments, >600 → 3, >1200 → 4 (short side entries still use 2).
 */
export function yearlyReviewSideSegmentCount(
  text: string | null | undefined
): YearlyReviewSideSegmentCount {
  const len = (text ?? '').trim().length;
  if (len > 1200) return 4;
  if (len > 600) return 3;
  return 2;
}

export function yearlyReviewCategoryRowWidth(
  segmentCount: number,
  compact = false
): number {
  const segmentWidth = compact
    ? YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT
    : YEARLY_REVIEW_DEFAULT_CARD_WIDTH;
  const gap = compact ? YEARLY_REVIEW_CATEGORY_GAME_GAP_COMPACT : YEARLY_REVIEW_CATEGORY_GAME_GAP;
  if (segmentCount <= 1) return segmentWidth;
  return segmentCount * segmentWidth + (segmentCount - 1) * gap;
}

export function yearlyReviewSideCardWidth(
  text: string | null | undefined,
  compact = false
): number {
  return yearlyReviewCategoryRowWidth(yearlyReviewSideSegmentCount(text), compact);
}

export function yearlyReviewSideImageWidth(compact = false): number {
  return compact ? YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT : YEARLY_REVIEW_DEFAULT_CARD_WIDTH;
}

export function yearlyReviewSideImageHeight(compact = false): number {
  return compact ? YEARLY_REVIEW_SIDE_IMAGE_HEIGHT_COMPACT : YEARLY_REVIEW_SIDE_IMAGE_HEIGHT;
}

export function yearlyReviewSideUsesLargeImage(text: string | null | undefined): boolean {
  return (text ?? '').trim().length > 250;
}

export function yearlyReviewSideImageMaxWidth(
  text: string | null | undefined,
  compact = false
): number {
  if (yearlyReviewSideUsesLargeImage(text)) {
    return compact ? YEARLY_REVIEW_SIDE_IMAGE_MAX_WIDTH_COMPACT : YEARLY_REVIEW_SIDE_IMAGE_MAX_WIDTH;
  }
  return compact ? YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT : YEARLY_REVIEW_DEFAULT_CARD_WIDTH;
}

export function yearlyReviewSideCardSlotWeight(
  game: YearlyReviewGameDto,
  compact = false
): number {
  if (!isSideImagePresentation(game.presentationType)) return 1;
  if (compact) return 2;
  return yearlyReviewSideSegmentCount(game.text);
}

/** Same starting size as default cards; steps down as segment count grows. */
export function yearlyReviewSideLayoutFontSize(
  text: string | null | undefined,
  compact = false
): string {
  const segments = yearlyReviewSideSegmentCount(text);
  const idx = segments - 2;
  if (compact) {
    return (['0.85rem', '0.75rem', '0.65rem'] as const)[idx];
  }
  return (['0.85rem', '0.75rem', '0.65rem'] as const)[idx];
}

export const YEARLY_REVIEW_GAME_PRESENTATION_OPTIONS: {
  value: YearlyReviewGamePresentationType;
  label: string;
}[] = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'IMAGE_LEFT', label: 'Image left' },
  { value: 'IMAGE_RIGHT', label: 'Image right' },
];

/** Lay out category games into rows; side-image cards consume one slot per segment. */
export function chunkYearlyReviewGames(
  items: YearlyReviewGameDto[],
  maxSlotsPerRow = 6,
  compact = false
): YearlyReviewGameDto[][] {
  if (items.length === 0) return [];
  const rows: YearlyReviewGameDto[][] = [];
  let currentRow: YearlyReviewGameDto[] = [];
  let currentSlots = 0;

  for (const item of items) {
    const slots = yearlyReviewSideCardSlotWeight(item, compact);
    if (currentRow.length > 0 && currentSlots + slots > maxSlotsPerRow) {
      rows.push(currentRow);
      currentRow = [];
      currentSlots = 0;
    }
    currentRow.push(item);
    currentSlots += slots;
  }

  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
}
