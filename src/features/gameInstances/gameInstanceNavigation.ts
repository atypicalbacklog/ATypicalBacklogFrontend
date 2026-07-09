import type { Location } from 'react-router-dom';

export interface GameInstanceReturnState {
  returnTo: string;
  returnLabel: string;
}

export function returnLabelForPath(pathname: string): string {
  if (pathname.startsWith('/backlog-completion-overview')) return 'Completion overview';
  if (pathname.startsWith('/backlog-submissions')) return 'Backlog submissions';
  if (pathname.startsWith('/backlog')) return 'Backlog';
  if (pathname.startsWith('/library')) return 'Library';
  if (pathname.startsWith('/reviews/yearly')) return 'Yearly review';
  if (pathname.startsWith('/reviews')) return 'Reviews';
  if (pathname.startsWith('/statistics')) return 'Statistics';
  if (pathname === '/' || pathname.startsWith('/public')) return 'Home';
  return 'previous view';
}

export function createGameInstanceReturnState(location: Location): GameInstanceReturnState {
  const returnTo = `${location.pathname}${location.search}`;
  return { returnTo, returnLabel: returnLabelForPath(location.pathname) };
}

export function resolveGameInstanceReturn(state: unknown): GameInstanceReturnState {
  const parsed = state as GameInstanceReturnState | null | undefined;
  if (parsed?.returnTo && parsed?.returnLabel) {
    return parsed;
  }
  return { returnTo: '/library', returnLabel: 'Library' };
}

export function gameInstanceTo(
  gameInstanceUid: string,
  returnState: GameInstanceReturnState
): { pathname: string; state: GameInstanceReturnState } {
  return {
    pathname: `/game-instances/${gameInstanceUid}`,
    state: returnState,
  };
}
