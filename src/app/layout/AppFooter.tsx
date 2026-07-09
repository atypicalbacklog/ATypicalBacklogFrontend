import { Box, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BLUESKY_PROFILE_URL, GITHUB_PROFILE_URL } from '../../features/shared/socialLinks';
import blueskyLogo from '../../assets/Bluesky_Logo.svg';

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        zIndex: (t) => t.zIndex.appBar - 1,
        width: 'fit-content',
        minWidth: { xs: 310, sm: 0 },
        //maxWidth: 'calc(100% - 16px)',
        maxWidth: '100%',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'grey.900',
        borderRadius: 2,
        px: 1.75,
        py: 0.6,
        boxShadow: 3,
      }}
    >
      <Stack spacing={0.25} alignItems="center">
        <Stack direction="row" spacing={2} flexWrap="nowrap" useFlexGap alignItems="center" justifyContent="center">
          <MuiLink component={RouterLink} to="/imprint" underline="hover" color="text.secondary">
            Imprint
          </MuiLink>
          <MuiLink component={RouterLink} to="/faq-glossar" underline="hover" color="text.secondary">
            FAQ &amp; Glossary
          </MuiLink>
          <MuiLink
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
          >
            Github
          </MuiLink>
          <MuiLink
            href={BLUESKY_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bluesky"
            color="text.secondary"
            sx={{ display: 'inline-flex', lineHeight: 0 }}
          >
            <Box
              component="img"
              src={blueskyLogo}
              alt=""
              sx={{ width: '1.125rem', height: '1.125rem' }}
            />
          </MuiLink>
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.675rem' }}>
          &copy; Atypical Backlog
        </Typography>
      </Stack>
    </Box>
  );
}
