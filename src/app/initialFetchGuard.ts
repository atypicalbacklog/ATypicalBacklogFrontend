/**
 * Prevents duplicate initial GET requests when React Strict Mode (or double mount)
 * runs effects twice. Call begin(key) at the start of a fetch effect; if it returns
 * false, skip the fetch. Call end(key) in the fetch's finally() so the key is
 * released when the request completes (allows refetch when user navigates back).
 */
const inFlight = new Set<string>();

export function initialFetchBegin(key: string): boolean {
  if (inFlight.has(key)) return false;
  inFlight.add(key);
  return true;
}

export function initialFetchEnd(key: string): void {
  inFlight.delete(key);
}
