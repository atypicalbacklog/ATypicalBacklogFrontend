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
import EditPlaythroughCompletionPage from '../features/playthroughs/EditPlaythroughCompletionPage';
import ManageYearTierlistPage from '../features/reviews/ManageYearTierlistPage';
import YearlyReviewEditPage from '../features/yearlyReview/YearlyReviewEditPage';
import AdditionalImagesPage from '../features/yearlyReview/AdditionalImagesPage';
import EditReviewPage from '../features/reviews/EditReviewPage';
import AdminImportStagingPage from '../features/admin/AdminImportStagingPage';
import EditStagedGamePage from '../features/admin/EditStagedGamePage';
import EditStagedPlaythroughGroupPage from '../features/admin/EditStagedPlaythroughGroupPage';
import StatisticsDashboardPage from '../features/statistics/StatisticsDashboardPage';
import BacklogCompletionOverviewPage from '../features/backlogCompletion/BacklogCompletionOverviewPage';
import BacklogSubmissionsPage from '../features/backlogSubmissions/BacklogSubmissionsPage';
import ReviewsPage from '../features/reviews/ReviewsPage';
import ImprintPage from '../features/static/ImprintPage';
import FaqGlossarPage from '../features/static/FaqGlossarPage';
import ModeAwareHome from './ModeAwareHome';
import ManagementOnly from './ManagementOnly';
import PublicRoute from './PublicRoute';

export const appRoutes = [
  { path: '/', element: <ModeAwareHome /> },
  { path: '/public', element: <PublicRoute /> },
  { path: '/games', element: <ManagementOnly><AddCatalogPage /></ManagementOnly> },
  { path: '/games/:uid', element: <ManagementOnly><GameDetailPage /></ManagementOnly> },
  { path: '/game-instances/:uid', element: <GameInstanceOverviewPage /> },
  { path: '/game-instances/:uid/edit', element: <ManagementOnly><GameInstanceDetailPage /></ManagementOnly> },
  {
    path: '/game-instances/:instanceUid/images/:imageUid/edit',
    element: (
      <ManagementOnly>
        <EditImagePage />
      </ManagementOnly>
    ),
  },
  { path: '/library', element: <LibraryPage /> },
  { path: '/backlog', element: <BacklogPage /> },
  { path: '/play-activity/active', element: <ManagementOnly><ActivePlaythroughsPage /></ManagementOnly> },
  { path: '/playthroughs/new', element: <ManagementOnly><AddPlaythroughPage /></ManagementOnly> },
  { path: '/playthroughs/:uid', element: <ManagementOnly><PlaythroughDetailPage /></ManagementOnly> },
  { path: '/playthroughs/:uid/complete', element: <ManagementOnly><EditPlaythroughCompletionPage /></ManagementOnly> },
  { path: '/reviews/year-tierlist', element: <ManagementOnly><ManageYearTierlistPage /></ManagementOnly> },
  { path: '/reviews', element: <ReviewsPage /> },
  { path: '/reviews/yearly', element: <ReviewsPage /> },
  { path: '/reviews/yearly/edit', element: <ManagementOnly><YearlyReviewEditPage /></ManagementOnly> },
  {
    path: '/reviews/yearly/additional-images',
    element: (
      <ManagementOnly>
        <AdditionalImagesPage />
      </ManagementOnly>
    ),
  },
  { path: '/reviews/edit', element: <ManagementOnly><EditReviewPage /></ManagementOnly> },
  { path: '/statistics', element: <StatisticsDashboardPage /> },
  { path: '/backlog-completion-overview', element: <BacklogCompletionOverviewPage /> },
  { path: '/backlog-submissions', element: <BacklogSubmissionsPage /> },
  { path: '/imprint', element: <ImprintPage /> },
  { path: '/faq-glossary', element: <FaqGlossarPage /> },
  { path: '/admin/import/staging', element: <ManagementOnly><AdminImportStagingPage /></ManagementOnly> },
  {
    path: '/admin/import/staged-games/:uid',
    element: (
      <ManagementOnly>
        <EditStagedGamePage />
      </ManagementOnly>
    ),
  },
  {
    path: '/admin/import/staged-playthrough-groups/:uid',
    element: (
      <ManagementOnly>
        <EditStagedPlaythroughGroupPage />
      </ManagementOnly>
    ),
  },
];
