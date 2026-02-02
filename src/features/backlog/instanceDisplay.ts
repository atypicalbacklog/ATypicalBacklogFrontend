import type { BacklogOverviewInstanceDto } from './types';

/**
 * Picks which instance to show as "default" from backend-provided list.
 * Rule: instance with playthrough or completion → else oldest in possession (by receivedDate) → else first.
 * Display-only; no domain state inferred.
 */
export function pickDefaultInstance(
  instances: BacklogOverviewInstanceDto[]
): BacklogOverviewInstanceDto | null {
  if (!instances.length) return null;
  const withActivity = instances.find(
    (i) => i.activePlaythroughUid != null || i.completionStateUid != null
  );
  if (withActivity) return withActivity;
  const inPossession = instances.filter((i) => i.inPossession);
  const byDate = (inPossession.length ? inPossession : instances)
    .filter((i) => i.receivedDate != null)
    .sort((a, b) =>
      (a.receivedDate ?? '').localeCompare(b.receivedDate ?? '')
    );
  return byDate.length ? byDate[0] : instances[0];
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
