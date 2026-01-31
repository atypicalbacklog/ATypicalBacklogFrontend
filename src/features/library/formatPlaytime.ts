/**
 * Formats total playtime seconds as "Xh Ym" or "Xm" or "—" when zero.
 */
export function formatPlaytime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}
