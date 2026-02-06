import type { BacklogOverviewInstanceDto } from './types';

/**
 * Picks which instance to show as the "selected" one (expanded by default).
 * Order: (1) active playthrough, (2) past playthroughs/completion, (3) most recent addition (receivedDate desc).
 * Display-only; no domain state inferred.
 */
export function pickDefaultInstance(
  instances: BacklogOverviewInstanceDto[]
): BacklogOverviewInstanceDto | null {
  if (!instances.length) return null;
  const withActive = instances.find((i) => i.activePlaythroughUid != null);
  if (withActive) return withActive;
  const withPastOrCompletion = instances.find(
    (i) => i.completionStateUid != null || i.totalPlaytimeSeconds > 0
  );
  if (withPastOrCompletion) return withPastOrCompletion;
  const byRecent = [...instances].filter((i) => i.receivedDate != null).sort(
    (a, b) => (b.receivedDate ?? '').localeCompare(a.receivedDate ?? '')
  );
  return byRecent.length ? byRecent[0] : instances[0];
}

/** All other instances (excluding the default) for "collapsed" section. */
export function otherInstances(
  instances: BacklogOverviewInstanceDto[],
  defaultInstance: BacklogOverviewInstanceDto | null
): BacklogOverviewInstanceDto[] {
  if (!defaultInstance) return [...instances];
  return instances.filter(
    (i) => i.gameInstanceUid !== defaultInstance.gameInstanceUid
  );
}
