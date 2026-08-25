import type { YearlyReviewGamePresentationType } from '../../types/dto';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';

export function normalizeYearlyReviewGamePresentationType(
  value: YearlyReviewGamePresentationType | string | null | undefined
): YearlyReviewGamePresentationType {
  const upper = (value ?? 'DEFAULT').toString().toUpperCase();
  if (upper === 'IMAGE_LEFT' || upper === 'IMAGE_RIGHT' || upper === 'COLUMN_WIDE') {
    return upper;
  }
  return 'DEFAULT';
}

export function isSideImagePresentation(
  value: YearlyReviewGamePresentationType | string | null | undefined
): boolean {
  const type = normalizeYearlyReviewGamePresentationType(value);
  return type === 'IMAGE_LEFT' || type === 'IMAGE_RIGHT';
}

export function isColumnWidePresentation(
  value: YearlyReviewGamePresentationType | string | null | undefined
): boolean {
  return normalizeYearlyReviewGamePresentationType(value) === 'COLUMN_WIDE';
}

/** Explicit text-only stand-in (no game / additional / preferred image). */
export function isTextOnlyYearlyReviewGame(game: YearlyReviewGameDto): boolean {
  return (
    !game.gameUid &&
    !game.gameInstanceUid &&
    !game.additionalImageUid &&
    !game.preferredImageUid
  );
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
  if (isColumnWidePresentation(game.presentationType)) return Number.POSITIVE_INFINITY;
  if (!isSideImagePresentation(game.presentationType)) return 1;
  if (compact) return 2;
  return yearlyReviewSideSegmentCount(game.text);
}

/** Side-layout text: start large, step down only when measured overflow (desktop). */
export const YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS = [
  '0.95rem',
  '0.9rem',
  '0.85rem',
  '0.8rem',
  '0.75rem',
] as const;

export const YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS_COMPACT = [
  '0.85rem',
  '0.8rem',
  '0.75rem',
] as const;

/** Any positive overflow should shrink; avoid ignoring partial-line clips. */
export const YEARLY_REVIEW_SIDE_TEXT_OVERFLOW_TOLERANCE_PX = 0;

export function yearlyReviewSideLayoutInitialFontSize(compact = false): string {
  return compact
    ? YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS_COMPACT[0]
    : YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS[0];
}

export const YEARLY_REVIEW_GAME_PRESENTATION_OPTIONS: {
  value: YearlyReviewGamePresentationType;
  label: string;
}[] = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'IMAGE_LEFT', label: 'Image left' },
  { value: 'IMAGE_RIGHT', label: 'Image right' },
  { value: 'COLUMN_WIDE', label: 'Column-Wide' },
];

/** Presentation choices allowed for text-only (no image) entries. */
export const YEARLY_REVIEW_TEXT_ONLY_PRESENTATION_OPTIONS =
  YEARLY_REVIEW_GAME_PRESENTATION_OPTIONS.filter(
    (o) => o.value === 'DEFAULT' || o.value === 'COLUMN_WIDE'
  );

/** Presentation choices when a game or additional image is linked. */
export const YEARLY_REVIEW_IMAGE_PRESENTATION_OPTIONS =
  YEARLY_REVIEW_GAME_PRESENTATION_OPTIONS.filter((o) => o.value !== 'COLUMN_WIDE');

/**
 * How many default-card slots fit in a category row for the given pixel width.
 * Caps at 6 (desktop) / 2 (compact); never below 1.
 */
export function yearlyReviewMaxSlotsForWidth(
  widthPx: number,
  compact = false
): number {
  const segmentWidth = compact
    ? YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT
    : YEARLY_REVIEW_DEFAULT_CARD_WIDTH;
  const gap = compact ? YEARLY_REVIEW_CATEGORY_GAME_GAP_COMPACT : YEARLY_REVIEW_CATEGORY_GAME_GAP;
  const maxCap = compact ? 2 : 6;
  // Unknown width: stay conservative so nowrap rows do not overflow before measure.
  if (!(widthPx > 0)) return 1;
  const slots = Math.floor((widthPx + gap) / (segmentWidth + gap));
  return Math.max(1, Math.min(maxCap, slots));
}

/**
 * Lay out category games into rows.
 * Side-image cards consume one slot per segment; COLUMN_WIDE always gets its own full row.
 * Items wider than the row (slots > maxSlots) occupy a solitary row.
 */
export function chunkYearlyReviewGames(
  items: YearlyReviewGameDto[],
  maxSlotsPerRow = 6,
  compact = false
): YearlyReviewGameDto[][] {
  if (items.length === 0) return [];
  const rows: YearlyReviewGameDto[][] = [];
  let currentRow: YearlyReviewGameDto[] = [];
  let currentSlots = 0;
  const maxSlots = Math.max(1, maxSlotsPerRow);

  for (const item of items) {
    if (isColumnWidePresentation(item.presentationType)) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
        currentSlots = 0;
      }
      rows.push([item]);
      continue;
    }

    const slots = yearlyReviewSideCardSlotWeight(item, compact);
    if (slots > maxSlots) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
        currentSlots = 0;
      }
      rows.push([item]);
      continue;
    }

    if (currentRow.length > 0 && currentSlots + slots > maxSlots) {
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
