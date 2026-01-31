import { Box } from '@mui/material';
import Navigation from './Navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex">
      <Navigation />
      <Box component="main" flexGrow={1} p={2}>
        {children}
      </Box>
    </Box>
  );
}
