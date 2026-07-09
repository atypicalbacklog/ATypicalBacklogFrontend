import { useState } from 'react';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import DesktopTopNav from './DesktopTopNav';
import AppFooter from './AppFooter';
import patternController from '../../assets/pattern_controller.svg';
import { getAppConfig } from '../AppConfig';
import { LANDING_HERO_TOP_NAV_GAP } from '../../features/landing/landingHeroConstants';
import { landingPageContainerSx, fullWidthPageContainerSx } from '../../features/landing/landingLayout';

function usesFullWidthColumn(pathname: string): boolean {
  if (pathname.startsWith('/library')) return true;
  return (
    pathname.startsWith('/backlog') &&
    !pathname.startsWith('/backlog-submissions') &&
    !pathname.startsWith('/backlog-completion-overview')
  );
}

function getPageTitle(pathname: string): string {
  const { mode } = getAppConfig();
  if (pathname === '/' || pathname === '') {
    return mode === 'MANAGEMENT' ? 'Active Playthroughs' : 'Home';
  }
  if (pathname.startsWith('/public')) return 'Public';
  if (pathname.startsWith('/library')) return 'Library';
  if (pathname.startsWith('/backlog-completion-overview')) return 'Backlog completion overview';
  if (pathname.startsWith('/backlog-submissions')) return 'Backlog submissions';
  if (pathname.startsWith('/backlog')) return 'Backlog';
  if (pathname.startsWith('/reviews/year-tierlist')) return 'Year tierlist';
  if (pathname.startsWith('/reviews/yearly')) return 'Yearly review';
  if (pathname.startsWith('/reviews')) return 'Reviews';
  if (pathname.startsWith('/admin/import')) return 'Import staging';
  if (pathname.startsWith('/play-activity/active')) return 'Active Playthroughs';
  if (pathname.startsWith('/playthroughs')) return 'Playthroughs';
  if (pathname.startsWith('/games/')) return 'Game details';
  if (pathname.startsWith('/games')) return 'Add new Game to Library';
  if (pathname.startsWith('/game-instances') && pathname.endsWith('/edit')) return 'Edit game instance';
  if (pathname.startsWith('/game-instances')) return 'Game instance';
  if (pathname.startsWith('/statistics')) return 'Statistics';
  if (pathname.startsWith('/imprint')) return 'Imprint';
  if (pathname.startsWith('/faq-glossar')) return 'FAQ & Glossary';
  return 'Atypical Backlog';
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentTitle = getPageTitle(location.pathname);
  const pageContainerSx = usesFullWidthColumn(location.pathname)
    ? fullWidthPageContainerSx
    : landingPageContainerSx;

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open);
  };

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
      {isMobile ? (
        <>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar variant="dense" sx={{ minHeight: 48 }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open navigation"
                onClick={handleDrawerToggle}
                sx={{ mr: 1.5 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="span" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {currentTitle}
              </Typography>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
              sx: {
                bgcolor: 'background.paper',
                width: 280,
                boxSizing: 'border-box',
                borderRight: 1,
                borderColor: 'divider',
              },
            }}
          >
            <Navigation onNavigate={handleDrawerToggle} />
          </Drawer>

          <Box component="main" flexGrow={1} sx={{ mt: 7, minWidth: 0, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, width: '100%' }}>
              <Box sx={pageContainerSx}>{children}</Box>
            </Box>
            <AppFooter />
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minWidth: 0,
            width: '100%',
          }}
        >
          <DesktopTopNav />
          <Box
            component="main"
            flexGrow={1}
            sx={{ m: 0, minWidth: 0, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <Box
              aria-hidden
              sx={{ height: (theme) => theme.spacing(LANDING_HERO_TOP_NAV_GAP), flexShrink: 0 }}
            />
            <Box sx={{ px: 2, pt: 0, pb: 2, width: '100%' }}>
              <Box sx={pageContainerSx}>{children}</Box>
            </Box>
            <AppFooter />
          </Box>
        </Box>
      )}
    </Box>
  );
}
