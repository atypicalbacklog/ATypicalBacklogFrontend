import type { SvgIconComponent } from '@mui/icons-material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import GamesIcon from '@mui/icons-material/Games';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReviewsIcon from '@mui/icons-material/Reviews';

export interface DesktopNavItem {
  label: string;
  to: string;
  icon: SvgIconComponent;
  isActive: (pathname: string) => boolean;
}

export function isHomeNavActive(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/public' ||
    pathname.startsWith('/play-activity/active')
  );
}

export const DESKTOP_NAV_LEFT: DesktopNavItem[] = [
  {
    label: 'Library',
    to: '/library',
    icon: GamesIcon,
    isActive: (pathname) => pathname.startsWith('/library'),
  },
  {
    label: 'Completion',
    to: '/backlog-completion-overview',
    icon: PlaylistAddCheckIcon,
    isActive: (pathname) => pathname.startsWith('/backlog-completion-overview'),
  },
  {
    label: 'Backlog',
    to: '/backlog',
    icon: BookmarksIcon,
    isActive: (pathname) =>
      pathname.startsWith('/backlog') &&
      !pathname.startsWith('/backlog-submissions') &&
      !pathname.startsWith('/backlog-completion-overview'),
  },
];

export const DESKTOP_NAV_RIGHT: DesktopNavItem[] = [
  {
    label: 'Submissions',
    to: '/backlog-submissions',
    icon: HowToVoteIcon,
    isActive: (pathname) => pathname.startsWith('/backlog-submissions'),
  },
  {
    label: 'Reviews',
    to: '/reviews',
    icon: ReviewsIcon,
    isActive: (pathname) => pathname.startsWith('/reviews'),
  },
  {
    label: 'Statistics',
    to: '/statistics',
    icon: BarChartIcon,
    isActive: (pathname) => pathname.startsWith('/statistics'),
  },
];
