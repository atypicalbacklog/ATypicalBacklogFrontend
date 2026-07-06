import { Link as RouterLink } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { landingCtaButtonSx } from './landingCtaButtonStyles';

export default function LandingHeroFooter() {
  return (
    <>
      <Box sx={{ mb: 2, minHeight: '1.5rem' }} aria-hidden />

      <Button
        component={RouterLink}
        to="/faq-glossar"
        disableElevation
        fullWidth
        sx={landingCtaButtonSx}
      >
        What is this website?
      </Button>
    </>
  );
}
