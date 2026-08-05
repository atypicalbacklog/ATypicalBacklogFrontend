import { Link as RouterLink } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { landingCtaButtonSx } from './landingCtaButtonStyles';
import { LANDING_HERO_TITLE_TO_FOOTER_GAP } from './landingHeroConstants';

export default function LandingHeroFooter() {
  return (
    <>
      <Box
        sx={{ mb: LANDING_HERO_TITLE_TO_FOOTER_GAP, minHeight: '1.5rem' }}
        aria-hidden
      />

      <Button
        component={RouterLink}
        to="/faq-glossary"
        disableElevation
        fullWidth
        sx={landingCtaButtonSx}
      >
        What is this website?
      </Button>
    </>
  );
}
