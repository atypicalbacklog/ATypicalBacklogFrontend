import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAppConfig } from './AppConfig';

interface ManagementOnlyProps {
  children: ReactNode;
}

export default function ManagementOnly({ children }: ManagementOnlyProps) {
  const { mode } = getAppConfig();

  if (mode !== 'MANAGEMENT') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

