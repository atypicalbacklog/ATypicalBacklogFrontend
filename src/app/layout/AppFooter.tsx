import { Box, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  BLUESKY_PROFILE_URL,
  GITHUB_PROFILE_URL,
  INSTAGRAM_PROFILE_URL,
} from '../../features/shared/socialLinks';
import blueskyLogo from '../../assets/Bluesky_Logo.svg';
import instagramLogo from '../../assets/Instagram_Glyph_Gradient.png';

/** Match AppShell mobile breakpoint (max-width: 600px). */
const mobileOnly = '@media (max-width:599.95px)';

const socialIconSx = {
  width: '1.125rem',
  height: '1.125rem',
  fontSize: '1.125rem',
  [mobileOnly]: {
    width: '1rem',
    height: '1rem',
    fontSize: '1rem',
  },
} as const;

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
        minWidth: 0,
        maxWidth: '100%',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'grey.900',
        borderRadius: 2,
        px: 1.75,
        py: 0.6,
        boxShadow: 3,
        [mobileOnly]: {
          px: 1,
          py: 0.45,
        },
      }}
    >
      <Stack spacing={{ xs: 0, sm: 0.25 }} alignItems="center">
        <Stack
          direction="row"
          spacing={2}
          flexWrap="nowrap"
          useFlexGap
          alignItems="center"
          justifyContent="center"
          sx={{
            [mobileOnly]: {
              gap: 1.25,
            },
          }}
        >
          <MuiLink
            component={RouterLink}
            to="/imprint"
            underline="hover"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              [mobileOnly]: { fontSize: '0.85rem' },
            }}
          >
            Imprint
          </MuiLink>
          <MuiLink
            component={RouterLink}
            to="/faq-glossary"
            underline="hover"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              [mobileOnly]: { fontSize: '0.85rem' },
            }}
          >
            FAQ &amp; Glossary
          </MuiLink>
          <MuiLink
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              [mobileOnly]: { fontSize: '0.85rem' },
            }}
          >
            GitHub
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
              sx={socialIconSx}
            />
          </MuiLink>
          <MuiLink
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            color="text.secondary"
            sx={{ display: 'inline-flex', lineHeight: 0 }}
          >
            <Box
              component="img"
              src={instagramLogo}
              alt=""
              sx={socialIconSx}
            />
          </MuiLink>
        </Stack>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            fontSize: '0.675rem',
            [mobileOnly]: { fontSize: '0.625rem' },
          }}
        >
          &copy; Atypical Backlog
        </Typography>
      </Stack>
    </Box>
  );
}
