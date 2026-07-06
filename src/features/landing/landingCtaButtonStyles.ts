export const landingCtaButtonSx = {
  minHeight: 48,
  py: 1.25,
  px: 2,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1.0625rem',
  boxShadow: 'none',
  bgcolor: 'grey.800',
  color: 'grey.300',
  border: 1,
  borderColor: 'grey.700',
  '&:hover': {
    bgcolor: 'grey.700',
    borderColor: 'grey.600',
    color: 'grey.200',
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    bgcolor: 'grey.900',
    color: 'grey.600',
    borderColor: 'grey.800',
  },
} as const;

/** Library / Backlog row in landing footer — compact on mobile so labels stay on one line. */
export const landingFooterNavButtonSx = {
  ...landingCtaButtonSx,
  fontSize: { xs: '0.8125rem', sm: '1.0625rem' },
  px: { xs: 1, sm: 2 },
  py: { xs: 1, sm: 1.25 },
  minHeight: { xs: 40, sm: 48 },
  whiteSpace: 'nowrap',
} as const;
