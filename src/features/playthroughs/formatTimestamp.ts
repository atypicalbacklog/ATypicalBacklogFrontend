/**
 * Formats an ISO instant for display (time only for quick access, or full local datetime).
 */
export function formatTimestamp(isoInstant: string | null | undefined): string {
  if (!isoInstant) return '—';
  try {
    const d = new Date(isoInstant);
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return isoInstant;
  }
}

/** Time only (e.g. "14:32") for compact display. */
export function formatTimeOnly(isoInstant: string | null | undefined): string {
  if (!isoInstant) return '—';
  try {
    return new Date(isoInstant).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoInstant;
  }
}

/** Date only (e.g. "1/15/24") for booking lists. */
export function formatDateOnly(isoInstant: string | null | undefined): string {
  if (!isoInstant) return '—';
  try {
    return new Date(isoInstant).toLocaleDateString(undefined, {
      dateStyle: 'short',
    });
  } catch {
    return isoInstant;
  }
}
