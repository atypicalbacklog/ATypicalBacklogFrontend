import DashboardPage from '../features/dashboard/DashboardPage';
import AddCatalogPage from '../features/catalog/AddCatalogPage';
import GameDetailPage from '../features/games/GameDetailPage';
import GameInstanceOverviewPage from '../features/gameInstances/GameInstanceOverviewPage';
import GameInstanceDetailPage from '../features/gameInstances/GameInstanceDetailPage';
import EditImagePage from '../features/gameInstances/EditImagePage';
import LibraryPage from '../features/library/LibraryPage';
import BacklogPage from '../features/backlog/BacklogPage';
import ActivePlaythroughsPage from '../features/playthroughs/ActivePlaythroughsPage';
import AddPlaythroughPage from '../features/playthroughs/AddPlaythroughPage';
import PlaythroughDetailPage from '../features/playthroughs/PlaythroughDetailPage';
import ManageYearTierlistPage from '../features/reviews/ManageYearTierlistPage';
import YearlyReviewPage from '../features/yearlyReview/YearlyReviewPage';
import YearlyReviewEditPage from '../features/yearlyReview/YearlyReviewEditPage';
import EditReviewPage from '../features/reviews/EditReviewPage';
import AdminImportStagingPage from '../features/admin/AdminImportStagingPage';
import EditStagedGamePage from '../features/admin/EditStagedGamePage';
import EditStagedPlaythroughGroupPage from '../features/admin/EditStagedPlaythroughGroupPage';
import StatisticsDashboardPage from '../features/statistics/StatisticsDashboardPage';
import BacklogCompletionOverviewPage from '../features/backlogCompletion/BacklogCompletionOverviewPage';

export const appRoutes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/games', element: <AddCatalogPage /> },
  { path: '/games/:uid', element: <GameDetailPage /> },
  { path: '/game-instances/:uid', element: <GameInstanceOverviewPage /> },
  { path: '/game-instances/:uid/edit', element: <GameInstanceDetailPage /> },
  { path: '/game-instances/:instanceUid/images/:imageUid/edit', element: <EditImagePage /> },
  { path: '/library', element: <LibraryPage /> },
  { path: '/backlog', element: <BacklogPage /> },
  { path: '/play-activity/active', element: <ActivePlaythroughsPage /> },
  { path: '/playthroughs/new', element: <AddPlaythroughPage /> },
  { path: '/playthroughs/:uid', element: <PlaythroughDetailPage /> },
  { path: '/reviews/year-tierlist', element: <ManageYearTierlistPage /> },
  { path: '/reviews/yearly', element: <YearlyReviewPage /> },
  { path: '/reviews/yearly/edit', element: <YearlyReviewEditPage /> },
  { path: '/reviews/edit', element: <EditReviewPage /> },
  { path: '/statistics', element: <StatisticsDashboardPage /> },
  { path: '/backlog-completion-overview', element: <BacklogCompletionOverviewPage /> },
  { path: '/admin/import/staging', element: <AdminImportStagingPage /> },
  { path: '/admin/import/staged-games/:uid', element: <EditStagedGamePage /> },
  { path: '/admin/import/staged-playthrough-groups/:uid', element: <EditStagedPlaythroughGroupPage /> },
];
