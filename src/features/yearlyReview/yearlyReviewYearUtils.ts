import { getAppConfig } from '../../app/AppConfig';

export const YEARLY_REVIEW_MIN_YEAR = 2017;
export const CURRENT_CALENDAR_YEAR = new Date().getFullYear();
export const LAST_CALENDAR_YEAR = CURRENT_CALENDAR_YEAR - 1;

/** Latest year selectable in the yearly review UI; current calendar year only in management mode. */
export function getYearlyReviewMaxSelectableYear(): number {
  return getAppConfig().mode === 'MANAGEMENT' ? CURRENT_CALENDAR_YEAR : LAST_CALENDAR_YEAR;
}

/** Descending list of years from max selectable down to 2017. */
export function getSelectableReviewYears(): number[] {
  const maxYear = getYearlyReviewMaxSelectableYear();
  return Array.from(
    { length: maxYear - YEARLY_REVIEW_MIN_YEAR + 1 },
    (_, i) => maxYear - i
  );
}

export function isSelectableReviewYear(year: number): boolean {
  return getSelectableReviewYears().includes(year);
}

/** Landing quick links: last calendar year and the two prior years. */
export function getLandingReviewYearLinks(): number[] {
  return [
    LAST_CALENDAR_YEAR,
    LAST_CALENDAR_YEAR - 1,
    LAST_CALENDAR_YEAR - 2,
  ];
}
