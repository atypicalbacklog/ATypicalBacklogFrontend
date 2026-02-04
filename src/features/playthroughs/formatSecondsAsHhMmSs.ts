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
