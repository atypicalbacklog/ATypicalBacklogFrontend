import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

const hueRotateBorder = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

const borderPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const RAINBOW_BORDER_PX = 2;
const RAINBOW_GRADIENT =
  'conic-gradient(from 0deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)';

export type PlaythroughBorderKind = 'none' | 'active' | 'inactive';

interface Props {
  kind: PlaythroughBorderKind;
  children: ReactNode;
  borderRadius?: number;
}

/** Border-only frame around an image (no fill / background overlay on the image). */
export default function PlaythroughBorderCard({
  kind,
  children,
  borderRadius = 1,
}: Props) {
  if (kind === 'none') {
    return <>{children}</>;
  }

  if (kind === 'active') {
    return (
      <Box
        sx={{
          position: 'relative',
          borderRadius,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            padding: `${RAINBOW_BORDER_PX}px`,
            boxSizing: 'border-box',
            background: RAINBOW_GRADIENT,
            animation: `${hueRotateBorder} 8s linear infinite`,
            pointerEvents: 'none',
            zIndex: 1,
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          },
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius,
        border: '2px solid',
        borderColor: '#9ca3af',
        overflow: 'hidden',
        boxSizing: 'border-box',
        animation: `${borderPulse} 2s ease-in-out infinite`,
      }}
    >
      {children}
    </Box>
  );
}
