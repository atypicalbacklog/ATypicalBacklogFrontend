import { Routes, Route } from 'react-router-dom';
import AppShell from './layout/AppShell';
import { appRoutes } from './routes';

export default function App() {
  return (
    <AppShell>
      <Routes>
        {appRoutes.map(r => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
    </AppShell>
  );
}
