import DashboardPage from '../features/dashboard/DashboardPage';
import ActivePlaythroughsPage from '../features/playthroughs/ActivePlaythroughsPage';
import { getAppConfig } from './AppConfig';

export default function ModeAwareHome() {
  const { mode } = getAppConfig();

  if (mode === 'MANAGEMENT') {
    return <ActivePlaythroughsPage />;
  }

  return <DashboardPage />;
}

