import type { SxProps, Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

/** Solid panel for intro/outro text (matches MuiTextField / edit review). */
export const yearlyReviewSolidTextPanelSx: SystemStyleObject<Theme> = {
  bgcolor: 'rgba(50, 50, 50, 1)',
  borderRadius: 1,
  border: 1,
  borderColor: 'divider',
  p: 2,
  whiteSpace: 'pre-wrap',
  lineHeight: 1.6,
};

/** Blurred panel for category sections (matches MuiCard and other app surfaces). */
export const yearlyReviewBlurredPanelSx: SxProps<Theme> = {
  bgcolor: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(4px)',
  borderRadius: 1,
  p: 2,
};

/** Compact blurred panel for centered filter bars (backlog, statistics). */
export const compactBlurredFilterPanelSx: SxProps<Theme> = {
  bgcolor: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(4px)',
  borderRadius: 1,
  width: 'fit-content',
  maxWidth: '100%',
  mx: 'auto',
  pt: 1,
  pb: 2,
  px: 2,
};

export const yearlyReviewIntroOutroTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    lineHeight: 1.6,
    alignItems: 'flex-start',
    bgcolor: 'rgba(50, 50, 50, 1)',
    '&:hover': {
      bgcolor: 'rgba(60, 60, 60, 1)',
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(70, 70, 70, 1)',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: 2,
  },
};
