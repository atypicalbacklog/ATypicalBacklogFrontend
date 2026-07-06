import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export const gameImageMissingBg = (theme: Theme) =>
  theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[400];

interface Props {
  sx?: SxProps<Theme>;
  /** Shorter copy for small thumbnails (e.g. list avatars). */
  compact?: boolean;
  /** When set, shown instead of the default missing-image copy. */
  label?: string;
}

export default function GameImageMissingPlaceholder({ sx, compact = false, label }: Props) {
  return (
    <Box
      sx={[
        (theme) => ({
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: gameImageMissingBg(theme),
          textAlign: 'center',
          px: compact ? 0.25 : 0.75,
          py: compact ? 0.25 : 0.5,
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontSize: compact ? '0.5rem' : '0.6875rem',
          lineHeight: 1.2,
          userSelect: 'none',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: compact ? 2 : 4,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {label ?? (compact ? 'no image' : 'no image available')}
      </Typography>
    </Box>
  );
}
