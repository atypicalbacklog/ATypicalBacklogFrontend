/** Main content column on the landing page (desktop). */
export const LANDING_PAGE_MAX_WIDTH = 1400;

/** MUI `md` dialog is 800px; landing review modal is slightly narrower. */
export const LANDING_REVIEW_MODAL_MAX_WIDTH = 800;

/**
 * Centers the landing column in the viewport on desktop (offsets the left nav rail).
 * Requires `--app-nav-width` on the nav element (see Navigation.tsx).
 */
export const landingPageContainerSx = {
  width: '100%',
  maxWidth: { xs: '100%', md: LANDING_PAGE_MAX_WIDTH },
  mx: 'auto',
  '@media (min-width: 601px)': {
    position: 'relative',
    left: 'calc(var(--app-nav-width, 200px) / -2)',
  },
} as const;
