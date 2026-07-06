export const LANDING_HERO_PHRASES = ['atypical backlog', 'a typical backlog'] as const;

export const LANDING_HERO_LONGEST_PHRASE = LANDING_HERO_PHRASES.reduce((a, b) =>
  a.length >= b.length ? a : b
);

export const LANDING_HERO_CURSOR_TEXT_GAP = { xs: '50px', sm: '72px' } as const;

export const LANDING_HERO_LINE_HEIGHT = { xs: '2.25rem', sm: '2.75rem' } as const;

/** Type B title — larger on desktop. */
export const LANDING_HERO_TYPE_B_FONT_SIZE = { xs: '1.75rem', sm: '2.5rem' } as const;
export const LANDING_HERO_TYPE_B_LINE_HEIGHT = { xs: '2.25rem', sm: '3rem' } as const;

export const LANDING_HERO_TITLE_TEXT_SX = {
  fontWeight: 700,
  letterSpacing: '0.02em',
  lineHeight: LANDING_HERO_LINE_HEIGHT,
  whiteSpace: 'nowrap',
  m: 0,
} as const;

export const LANDING_HERO_TYPE_B_TITLE_TEXT_SX = {
  ...LANDING_HERO_TITLE_TEXT_SX,
  fontSize: LANDING_HERO_TYPE_B_FONT_SIZE,
  lineHeight: LANDING_HERO_TYPE_B_LINE_HEIGHT,
} as const;

/** Solid FF-style text window — light outer frame, dark inner inset, gray palette. */
export const landingHeroWindowSx = {
  bgcolor: 'grey.900',
  border: '2px solid',
  borderColor: 'grey.400',
  boxShadow: 'inset 0 0 0 2px grey.800',
  borderRadius: { xs: '12px', sm: '16px' },
  px: { xs: 2, sm: 3 },
  py: { xs: 1.5, sm: 2 },
} as const;
