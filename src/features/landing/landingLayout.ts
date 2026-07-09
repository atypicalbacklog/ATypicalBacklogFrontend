/** Main content column on the landing page (desktop). */
export const LANDING_PAGE_MAX_WIDTH = 1400;

/** MUI `md` dialog is 800px; landing review modal is slightly narrower. */
export const LANDING_REVIEW_MODAL_MAX_WIDTH = 800;

export const landingPageContainerSx = {
  width: '100%',
  maxWidth: { xs: '100%', md: LANDING_PAGE_MAX_WIDTH },
  mx: 'auto',
} as const;

/** Full-width content column for data-heavy views (library, backlog). */
export const fullWidthPageContainerSx = {
  width: '100%',
} as const;

/** Centered column that shrinks to content (filters, toolbars). */
export const centeredFitContentColumnSx = {
  width: 'fit-content',
  maxWidth: '100%',
  mx: 'auto',
} as const;
