import DashboardPage from '../features/dashboard/DashboardPage';
import GamesPage from '../features/games/GamesPage';
import GameDetailPage from '../features/games/GameDetailPage';
import GameInstanceDetailPage from '../features/gameInstances/GameInstanceDetailPage';
import LibraryPage from '../features/library/LibraryPage';

export const appRoutes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/games', element: <GamesPage /> },
  { path: '/games/:uid', element: <GameDetailPage /> },
  { path: '/game-instances/:uid', element: <GameInstanceDetailPage /> },
  { path: '/library', element: <LibraryPage /> },
];
