import type { BacklogFilterState } from './types';

export function hasActiveFilters(
  filters: BacklogFilterState,
  initial: BacklogFilterState
): boolean {
  return (
    filters.searchText !== initial.searchText ||
    filters.consoleUids.length > 0 ||
    filters.platformUids.length > 0 ||
    filters.hasActivePlaythrough !== null ||
    filters.completionStateUids.length > 0
  );
}

export function filtersToSearchParams(f: BacklogFilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.searchText) p.set('q', f.searchText);
  if (f.consoleUids.length) p.set('consoles', f.consoleUids.join(','));
  if (f.platformUids.length) p.set('platforms', f.platformUids.join(','));
  if (f.hasActivePlaythrough !== null)
    p.set('active', String(f.hasActivePlaythrough));
  if (f.completionStateUids.length)
    p.set('completion', f.completionStateUids.join(','));
  return p;
}

export function searchParamsToFilters(
  p: URLSearchParams,
  fallback: BacklogFilterState
): BacklogFilterState {
  return {
    searchText: p.get('q') ?? fallback.searchText,
    consoleUids: p.get('consoles')?.split(',').filter(Boolean) ?? [],
    platformUids: p.get('platforms')?.split(',').filter(Boolean) ?? [],
    hasActivePlaythrough: p.has('active')
      ? p.get('active') === 'true'
      : null,
    completionStateUids: p.get('completion')?.split(',').filter(Boolean) ?? [],
  };
}
