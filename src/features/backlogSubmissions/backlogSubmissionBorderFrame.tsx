import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import type { BacklogSubmissionStateBorder } from './backlogSubmissionStateLabels';

const hueRotateBorder = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

export const RAINBOW_BORDER_PX = 2;
export const RAINBOW_GRADIENT =
  'conic-gradient(from 0deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)';

export const SUBMISSION_BORDER_COLORS: Record<
  Exclude<BacklogSubmissionStateBorder, 'none' | 'rainbow'>,
  string
> = {
  gold: '#eab308',
  red: '#ef4444',
  blue: '#3b82f6',
};

interface Props {
  border: BacklogSubmissionStateBorder;
  borderRadius?: number;
  innerBg?: string;
  /** Light fill inside solid borders (banner text panels). */
  tinted?: boolean;
  children: ReactNode;
  sx?: object;
}

export default function SubmissionStateBorderFrame({
  border,
  borderRadius = 1,
  innerBg = 'background.paper',
  tinted = false,
  children,
  sx,
}: Props) {
  if (border === 'none') {
    return <Box sx={sx}>{children}</Box>;
  }

  if (border === 'rainbow') {
    return (
      <Box
        sx={{
          position: 'relative',
          borderRadius,
          overflow: 'hidden',
          ...sx,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: RAINBOW_GRADIENT,
            animation: `${hueRotateBorder} 8s linear infinite`,
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            m: `${RAINBOW_BORDER_PX}px`,
            borderRadius: Math.max(0, borderRadius - 0.25),
            bgcolor: innerBg,
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }

  const borderColor = SUBMISSION_BORDER_COLORS[border];
  const tint =
    border === 'gold'
      ? 'rgba(234, 179, 8, 0.1)'
      : border === 'red'
        ? 'rgba(239, 68, 68, 0.08)'
        : 'rgba(59, 130, 246, 0.08)';

  return (
    <Box
      sx={{
        border: 2,
        borderColor,
        borderRadius,
        bgcolor:
          innerBg === 'transparent' ? 'transparent' : tinted ? tint : innerBg,
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
