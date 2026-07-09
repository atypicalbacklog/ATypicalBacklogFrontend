import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, IconButton, Link, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import {
  DESKTOP_NAV_LEFT,
  DESKTOP_NAV_RIGHT,
  isHomeNavActive,
  type DesktopNavItem,
} from './desktopNavConfig';

function navLinkSx(active: boolean) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    color: active ? 'primary.main' : 'text.secondary',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: { sm: '0.875rem', md: '0.9375rem' },
    lineHeight: 1.25,
    px: { sm: 1, md: 1.5 },
    py: 0.75,
    borderRadius: 1,
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.15s ease',
    '& .MuiSvgIcon-root': {
      fontSize: '1.125rem',
    },
    '&:hover': {
      color: active ? 'primary.main' : 'text.primary',
    },
  };
}

function DesktopNavLink({ item }: { item: DesktopNavItem }) {
  const { pathname } = useLocation();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link component={RouterLink} to={item.to} sx={navLinkSx(active)}>
      <Icon fontSize="inherit" />
      {item.label}
    </Link>
  );
}

export default function DesktopTopNav() {
  const { pathname } = useLocation();
  const homeActive = isHomeNavActive(pathname);

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        pt: '4px',
        pb: 0,
        px: 2,
        flexShrink: 0,
      }}
    >
      <Box
        component="nav"
        aria-label="Primary navigation"
        sx={{
          bgcolor: 'grey.900',
          borderRadius: { sm: '16px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { sm: 2.5, md: 4 },
          maxWidth: '100%',
          px: { sm: 2.5, md: 4 },
          py: { sm: 1, md: 1.25 },
        }}
      >
        <Stack direction="row" spacing={{ sm: 2, md: 3 }} alignItems="center">
          {DESKTOP_NAV_LEFT.map((item) => (
            <DesktopNavLink key={item.to} item={item} />
          ))}
        </Stack>

        <IconButton
          component={RouterLink}
          to="/"
          aria-label="Home"
          size="small"
          sx={{
            mx: { sm: 0.5, md: 1 },
            color: homeActive ? 'primary.main' : 'text.secondary',
            '&:hover': {
              color: homeActive ? 'primary.main' : 'text.primary',
              bgcolor: 'rgba(255, 255, 255, 0.06)',
            },
          }}
        >
          <HomeIcon />
        </IconButton>

        <Stack direction="row" spacing={{ sm: 2, md: 3 }} alignItems="center">
          {DESKTOP_NAV_RIGHT.map((item) => (
            <DesktopNavLink key={item.label} item={item} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
