import { Box } from '@mui/material';
import Navigation from './Navigation';
import patternController from '../../assets/pattern_controller.svg';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#2a2a2a',
        backgroundImage: `url(${patternController})`,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: '100px',
        backgroundBlendMode: 'overlay'
      }}
    >
      <Navigation />
      <Box component="main" flexGrow={1} p={2}>
        {children}
      </Box>
    </Box>
  );
}
