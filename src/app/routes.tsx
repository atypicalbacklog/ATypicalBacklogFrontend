import DashboardPage from '../features/dashboard/DashboardPage';
import GamesPage from '../features/games/GamesPage';
import GameDetailPage from '../features/games/GameDetailPage';
import GameInstanceDetailPage from '../features/gameInstances/GameInstanceDetailPage';
import LibraryPage from '../features/library/LibraryPage';
import BacklogPage from '../features/backlog/BacklogPage';
import ActivePlaythroughsPage from '../features/playthroughs/ActivePlaythroughsPage';
import AddPlaythroughPage from '../features/playthroughs/AddPlaythroughPage';
import PlaythroughDetailPage from '../features/playthroughs/PlaythroughDetailPage';

export const appRoutes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/games', element: <GamesPage /> },
  { path: '/games/:uid', element: <GameDetailPage /> },
  { path: '/game-instances/:uid', element: <GameInstanceDetailPage /> },
  { path: '/library', element: <LibraryPage /> },
  { path: '/backlog', element: <BacklogPage /> },
  { path: '/play-activity/active', element: <ActivePlaythroughsPage /> },
  { path: '/playthroughs/new', element: <AddPlaythroughPage /> },
  { path: '/playthroughs/:uid', element: <PlaythroughDetailPage /> },
];
