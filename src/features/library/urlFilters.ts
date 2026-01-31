import { LibraryFilterState } from './types';

/** True if any filter differs from initial (search, platform, console, backlog, active, completion, sort). */
export function hasActiveFilters(
  filters: LibraryFilterState,
  initial: LibraryFilterState
): boolean {
  return (
    filters.searchText !== initial.searchText ||
    filters.platformUids.length > 0 ||
    filters.consoleUids.length > 0 ||
    filters.inBacklog !== null ||
    filters.hasActivePlaythrough !== null ||
    filters.completionStateUids.length > 0 ||
    filters.sortMode !== initial.sortMode
  );
}

export function filtersToSearchParams(f: LibraryFilterState) {
  const p = new URLSearchParams();

  if (f.searchText) p.set('q', f.searchText);
  if (f.platformUids.length) p.set('platforms', f.platformUids.join(','));
  if (f.consoleUids.length) p.set('consoles', f.consoleUids.join(','));
  if (f.inBacklog !== null) p.set('backlog', String(f.inBacklog));
  if (f.hasActivePlaythrough !== null)
    p.set('active', String(f.hasActivePlaythrough));
  if (f.completionStateUids.length)
    p.set('completion', f.completionStateUids.join(','));
  if (f.sortMode) p.set('sort', f.sortMode);

  return p;
}

export function searchParamsToFilters(
  p: URLSearchParams,
  fallback: LibraryFilterState
): LibraryFilterState {
  return {
    searchText: p.get('q') ?? fallback.searchText,
    platformUids: p.get('platforms')?.split(',') ?? [],
    consoleUids: p.get('consoles')?.split(',') ?? [],
    inBacklog: p.has('backlog')
      ? p.get('backlog') === 'true'
      : null,
    hasActivePlaythrough: p.has('active')
      ? p.get('active') === 'true'
      : null,
    completionStateUids: p.get('completion')?.split(',') ?? [],
    sortMode:
      (p.get('sort') as LibraryFilterState['sortMode']) ??
      fallback.sortMode,
  };
}
