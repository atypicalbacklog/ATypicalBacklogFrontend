import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { LANDING_CAPTION_CARD_WIDTH } from './landingFeedConstants';

interface Props {
  children: ReactNode;
  width?: number;
}

/** Bordered frame wrapping cover image + footer text on public feed cards. */
export default function FeedCaptionCardFrame({ children, width = LANDING_CAPTION_CARD_WIDTH }: Props) {
  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
      }}
    >
      {children}
    </Box>
  );
}
