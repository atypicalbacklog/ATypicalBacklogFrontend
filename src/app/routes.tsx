import DashboardPage from '../features/dashboard/DashboardPage';
import AddCatalogPage from '../features/catalog/AddCatalogPage';
import GameDetailPage from '../features/games/GameDetailPage';
import GameInstanceOverviewPage from '../features/gameInstances/GameInstanceOverviewPage';
import GameInstanceDetailPage from '../features/gameInstances/GameInstanceDetailPage';
import LibraryPage from '../features/library/LibraryPage';
import BacklogPage from '../features/backlog/BacklogPage';
import ActivePlaythroughsPage from '../features/playthroughs/ActivePlaythroughsPage';
import AddPlaythroughPage from '../features/playthroughs/AddPlaythroughPage';
import PlaythroughDetailPage from '../features/playthroughs/PlaythroughDetailPage';
import ManageYearTierlistPage from '../features/reviews/ManageYearTierlistPage';
import EditReviewPage from '../features/reviews/EditReviewPage';
import AdminImportStagingPage from '../features/admin/AdminImportStagingPage';

export const appRoutes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/games', element: <AddCatalogPage /> },
  { path: '/games/:uid', element: <GameDetailPage /> },
  { path: '/game-instances/:uid', element: <GameInstanceOverviewPage /> },
  { path: '/game-instances/:uid/edit', element: <GameInstanceDetailPage /> },
  { path: '/library', element: <LibraryPage /> },
  { path: '/backlog', element: <BacklogPage /> },
  { path: '/play-activity/active', element: <ActivePlaythroughsPage /> },
  { path: '/playthroughs/new', element: <AddPlaythroughPage /> },
  { path: '/playthroughs/:uid', element: <PlaythroughDetailPage /> },
  { path: '/reviews/year-tierlist', element: <ManageYearTierlistPage /> },
  { path: '/reviews/edit', element: <EditReviewPage /> },
  { path: '/admin/import/staging', element: <AdminImportStagingPage /> },
];
