import { Navigate } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage';
import { getAppConfig } from './AppConfig';

/** `/public` — landing preview in management; redirect home in public mode. */
export default function PublicRoute() {
  const { mode } = getAppConfig();

  if (mode === 'PUBLIC') {
    return <Navigate to="/" replace />;
  }

  return <LandingPage />;
}
