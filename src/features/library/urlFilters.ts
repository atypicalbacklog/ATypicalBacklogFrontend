import { CompletionFilterIntent, LibraryFilterState } from './types';

/** True if any filter differs from initial. */
export function hasActiveFilters(
  filters: LibraryFilterState,
  initial: LibraryFilterState
): boolean {
  return (
    filters.searchText !== initial.searchText ||
    filters.platformUids.length > 0 ||
    filters.consoleUids.length > 0 ||
    filters.ignorePorts ||
    filters.inBacklog !== null ||
    filters.hasActivePlaythrough !== null ||
    filters.completionFilterIntents.length > 0 ||
    filters.completionStateUids.length > 0 ||
    filters.playthroughTypeUids.length > 0 ||
    filters.includeDlc !== initial.includeDlc ||
    filters.onlyGamesWithDlc !== null ||
    filters.sortMode !== initial.sortMode
  );
}

export function libraryFiltersEqual(
  a: LibraryFilterState,
  b: LibraryFilterState
): boolean {
  return (
    a.searchText === b.searchText &&
    a.ignorePorts === b.ignorePorts &&
    a.inBacklog === b.inBacklog &&
    a.hasActivePlaythrough === b.hasActivePlaythrough &&
    a.includeDlc === b.includeDlc &&
    a.onlyGamesWithDlc === b.onlyGamesWithDlc &&
    a.sortMode === b.sortMode &&
    a.platformUids.join('\0') === b.platformUids.join('\0') &&
    a.consoleUids.join('\0') === b.consoleUids.join('\0') &&
    a.completionFilterIntents.join('\0') === b.completionFilterIntents.join('\0') &&
    a.completionStateUids.join('\0') === b.completionStateUids.join('\0') &&
    a.playthroughTypeUids.join('\0') === b.playthroughTypeUids.join('\0')
  );
}

export function filtersToSearchParams(f: LibraryFilterState) {
  const p = new URLSearchParams();

  if (f.searchText) p.set('q', f.searchText);
  if (f.platformUids.length) p.set('platforms', f.platformUids.join(','));
  if (f.consoleUids.length) p.set('consoles', f.consoleUids.join(','));
  if (f.ignorePorts) p.set('ignorePorts', 'true');
  if (f.inBacklog !== null) p.set('backlog', String(f.inBacklog));
  if (f.hasActivePlaythrough !== null)
    p.set('active', String(f.hasActivePlaythrough));
  if (f.completionFilterIntents.length)
    p.set('completionIntents', f.completionFilterIntents.join(','));
  if (f.completionStateUids.length)
    p.set('completion', f.completionStateUids.join(','));
  if (f.playthroughTypeUids.length)
    p.set('playthroughTypes', f.playthroughTypeUids.join(','));
  if (f.includeDlc === false) p.set('includeDlc', 'false');
  if (f.onlyGamesWithDlc !== null)
    p.set('onlyGamesWithDlc', String(f.onlyGamesWithDlc));
  if (f.sortMode) p.set('sort', f.sortMode);

  return p;
}

export function searchParamsToFilters(
  p: URLSearchParams,
  fallback: LibraryFilterState
): LibraryFilterState {
  return {
    searchText: p.get('q') ?? fallback.searchText,
    platformUids: p.get('platforms')?.split(',').filter(Boolean) ?? [],
    consoleUids: p.get('consoles')?.split(',').filter(Boolean) ?? [],
    ignorePorts: p.get('ignorePorts') === 'true',
    inBacklog: p.has('backlog')
      ? p.get('backlog') === 'true'
      : null,
    hasActivePlaythrough: p.has('active')
      ? p.get('active') === 'true'
      : null,
    completionFilterIntents:
      (p
        .get('completionIntents')
        ?.split(',')
        .filter(Boolean) ?? []) as CompletionFilterIntent[],
    completionStateUids: p.get('completion')?.split(',').filter(Boolean) ?? [],
    playthroughTypeUids: p.get('playthroughTypes')?.split(',').filter(Boolean) ?? [],
    includeDlc: p.has('includeDlc')
      ? p.get('includeDlc') === 'true'
      : fallback.includeDlc,
    onlyGamesWithDlc: p.has('onlyGamesWithDlc')
      ? p.get('onlyGamesWithDlc') === 'true'
      : null,
    sortMode:
      (p.get('sort') as LibraryFilterState['sortMode']) ??
      fallback.sortMode,
  };
}
