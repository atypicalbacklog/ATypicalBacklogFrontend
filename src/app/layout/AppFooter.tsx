import { Box, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const GITHUB_URL = 'https://github.com';

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
        bgcolor: 'background.paper',
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
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
          >
            Github
          </MuiLink>
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.675rem' }}>
          &copy; Atypical Backlog
        </Typography>
      </Stack>
    </Box>
  );
}
