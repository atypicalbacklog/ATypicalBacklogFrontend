/**
 * Tier list / review tier colors (S, A, B, C, D, E, F, …).
 * Use with getTierColorByIndex(tierOrderIndex) for consistent styling.
 */
export const TIER_COLORS = [
  '#ff8080', // S - red
  '#ffbf80', // A - orange
  '#ffff7f', // B - yellow
  '#7fff7f', // C - green
  '#7fbfff', // D - blue
  '#7f7fff', // E - purple
  '#ff7fff', // F - magenta
  '#7f7f7f', // ? - gray
];

export function getTierColorByIndex(index: number): string {
  return TIER_COLORS[index % TIER_COLORS.length];
}
