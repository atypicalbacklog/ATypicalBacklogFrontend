/**
 * Formats seconds as hh:mm:ss. Uses backend total only; no client-side total calculation.
 */
export function formatSecondsAsHhMmSs(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Formats seconds as hours and minutes only (no seconds), e.g. "0h 00m" or "12h 30m". */
export function formatSecondsAsHhMm(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
