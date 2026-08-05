export const COLOR_BLUE = '#1976D2';
export const COLOR_RED = '#D32F2F';
export const COLOR_YELLOW = '#FBC02D';
export const COLOR_GREEN = '#2E7D32';
export const COLOR_CYAN = '#00ACC1';
export const COLOR_PINK = '#D81B60';
export const COLOR_GREY = '#9E9E9E';
export const COLOR_ORANGE = '#F57C00';

/** Format decimal hours as "Xh:XXm" (rounded to nearest minute). */
export function formatPlaytimeHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h:${String(m).padStart(2, '0')}m`;
}

/**
 * Compact hours-only label for bar charts (avoids long "Xh:XXm" overflow).
 * Whole hours → "12h"; otherwise one decimal → "12.5h".
 */
export function formatChartHoursOnly(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  if (Number.isInteger(rounded) || Math.abs(rounded - Math.round(rounded)) < 1e-9) {
    return `${Math.round(rounded)}h`;
  }
  return `${rounded.toFixed(1)}h`;
}

/** Floored whole hours for compact bar labels (no unit suffix). Returns null when < 1 hour. */
export function formatChartHoursFloorInt(hours: number): string | null {
  const h = Math.floor(hours);
  if (h <= 0) return null;
  return String(h);
}

/** Whole-number label for count bar charts. */
export function formatChartCountLabel(value: number): string | null {
  const n = Math.floor(value);
  if (n <= 0) return null;
  return String(n);
}

/** Percent for stacked charts: no decimals if whole number, else one decimal. */
export function formatPercentChartLabel(pct: number): string {
  const rounded = Math.round(pct * 10) / 10;
  if (Number.isInteger(rounded) || Math.abs(rounded - Math.round(rounded)) < 1e-9) {
    return `${Math.round(rounded)}%`;
  }
  return `${rounded.toFixed(1)}%`;
}

/** Minimum bar dimension (px) to show a label; avoids cramped/overlapping labels on small segments. */
export const MIN_BAR_LABEL_PX = 18;

/** Never show a bar label when either bar dimension is below this (px). */
export const MIN_BAR_LABEL_ABSOLUTE_PX = 16;

/** Min bar width (px) to fit a label by character count (grouped bar charts). */
export function minBarLabelWidthForText(label: string): number {
  const len = label.length;
  if (len <= 2) return 16;
  if (len === 3) return 24;
  return 32;
}

/** Show a bar label only when the bar is large enough for its text width. */
export function barLabelIfFits(
  label: string | null,
  bar: { height: number; width: number }
): string | null {
  if (!label) return null;
  if (bar.height < MIN_BAR_LABEL_ABSOLUTE_PX || bar.width < MIN_BAR_LABEL_ABSOLUTE_PX) {
    return null;
  }
  if (bar.width < minBarLabelWidthForText(label)) return null;
  return label;
}

/** Minimum pie slice angle (degrees) to show an arc label; hides labels on very small slices. */
export const MIN_PIE_ARC_LABEL_ANGLE = 8;

/** Pie chart layout: legend beside chart on desktop, below on narrow viewports. */
export function getPieChartLayout(compact: boolean) {
  if (compact) {
    return {
      height: 360,
      margin: { top: 10, right: 10, bottom: 72, left: 10 },
      legend: { position: { vertical: 'bottom' as const, horizontal: 'center' as const } },
    };
  }
  return {
    height: 320,
    margin: { top: 10, right: 120, bottom: 10, left: 10 },
    legend: { position: { vertical: 'middle' as const } },
  };
}

/**
 * Default MUI X Charts outer margins. Extra `margin.left` widens empty space before the plot;
 * the Y-axis already reserves space for tick labels, so keep left small.
 */
export const chartMargins = {
  /** Vertical bars, numeric Y (e.g. years on X). */
  barVertical: { top: 20, right: 20, bottom: 0, left: 0 } as const,
  /** Vertical bars with more bottom room (angled X labels). */
  barVerticalWideBottom: { top: 20, right: 20, bottom: 0, left: 0 } as const,
  /** Horizontal bar layout (category labels on Y). */
  barHorizontal: { top: 20, right: 20, bottom: 0, left: 10 } as const,
  /** Stacked % charts, legend top, vertical bars. */
  stackedVertical: { top: 10, right: 20, bottom: 0, left: 0 } as const,
  /** Stacked % charts, horizontal bars (years / short labels on Y). */
  stackedHorizontal: { top: 10, right: 20, bottom: 0, left: 0 } as const,
} as const;

/**
 * Returns a text color (#000000 or #ffffff) that contrasts with the given background color.
 * Uses relative luminance (sRGB) so labels stay readable on any bar color.
 */
export function getContrastTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace(/^#/, '');
  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
  } else {
    return '#000000';
  }
  /*
   * sRGB → linear light (WCAG/CIE). sRGB has a gamma curve: for dark values (c ≤ 0.04045)
   * we use the linear segment (c / 12.92); for brighter values we use ((c + 0.055) / 1.055)^2.4.
   * Relative luminance L uses coefficients 0.2126 (R), 0.7152 (G), 0.0722 (B) from ITU-R BT.709.
   * L > 0.5 → use black text on this background; otherwise white.
   */
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.5 ? '#000000' : '#ffffff';
}

/** Use with BarChart slotProps so bar labels use black or white text depending on bar color. */
export const contrastBarLabelSlotProps = {
  barLabel: (ownerState: { color?: string }) => ({
    style: { fill: getContrastTextColor(ownerState?.color ?? '#000000') },
  }),
};

/**
 * Weekday colors (0 = Monday … 6 = Sunday).
 * Monday Blue, Tuesday Red, Wednesday Yellow, Thursday Green, Friday Orange, Saturday Cyan, Sunday #7baaf7
 */
export const WEEKDAY_COLORS: readonly string[] = [
  COLOR_BLUE,   // Monday
  COLOR_RED,    // Tuesday
  COLOR_YELLOW, // Wednesday
  COLOR_GREEN,  // Thursday
  COLOR_ORANGE, // Friday
  COLOR_CYAN,   // Saturday
  '#7baaf7',    // Sunday
];

export function getWeekdayColor(weekdayIndex: number): string {
  if (weekdayIndex >= 0 && weekdayIndex < WEEKDAY_COLORS.length) return WEEKDAY_COLORS[weekdayIndex];
  return COLOR_GREY;
}

/**
 * Year colors (repeat/rotate after 2022):
 * 2017 blue, 2018 red, 2019 yellow, 2020 green, 2021 cyan, 2022 pink, 2023 blue, ...
 */
const YEAR_COLORS = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_GREEN, COLOR_CYAN, COLOR_PINK];

export function getYearColor(year: number): string {
  if (!Number.isFinite(year)) return COLOR_GREY;
  if (year <= 2017) return COLOR_BLUE;
  const idx = (year - 2017) % YEAR_COLORS.length;
  return YEAR_COLORS[idx];
}

export function yearOrdinalColorMap(xAxisValues: string[]) {
  return {
    type: 'ordinal' as const,
    values: xAxisValues,
    colors: xAxisValues.map((v) => getYearColor(Number(v))),
    unknownColor: COLOR_GREY,
  };
}

function normalizeKey(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function getVariantColor(variantName: string): string {
  const key = normalizeKey(variantName);
  if (key === 'consoleexclusive') return COLOR_GREEN;
  if (key === 'multiplatform') return COLOR_YELLOW;
  if (key === 'port') return COLOR_RED;
  if (key === 'original') return COLOR_BLUE;
  return COLOR_GREY;
}

/** Palette for console segments (e.g. in stacked % chart); cycles for many consoles. */
const CONSOLE_PALETTE = [
  COLOR_BLUE,
  COLOR_RED,
  COLOR_YELLOW,
  COLOR_GREEN,
  COLOR_CYAN,
  COLOR_PINK,
  COLOR_ORANGE,
  '#7baaf7',
  '#8D6E63',
  '#5E35B1',
];

export function getConsoleColorByIndex(index: number): string {
  if (index >= 0 && index < CONSOLE_PALETTE.length) return CONSOLE_PALETTE[index];
  return CONSOLE_PALETTE[index % CONSOLE_PALETTE.length] ?? COLOR_GREY;
}

