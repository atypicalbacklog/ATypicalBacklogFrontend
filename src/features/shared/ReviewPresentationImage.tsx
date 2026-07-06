import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import SmartImage, { type SmartImageFit } from './SmartImage';
import type { ReviewPresentationType } from '../../types/dto';

const hueRotateBorder = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

const RAINBOW_BORDER_PX = 2;
const RAINBOW_GRADIENT =
  'conic-gradient(from 0deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)';

export interface ReviewPresentationImageProps {
  imageUid: string | null;
  presentationType?: ReviewPresentationType | string | null;
  thumbnail?: boolean;
  alt?: string;
  aspectRatio?: number;
  fit?: SmartImageFit;
  sx?: SxProps<Theme>;
  imgSx?: SxProps<Theme>;
}

function normalizePresentationType(
  value: ReviewPresentationType | string | null | undefined
): ReviewPresentationType {
  const upper = (value ?? 'DEFAULT').toString().toUpperCase();
  if (upper === 'UPDATED' || upper === 'REPEAT' || upper === 'REPLACED') return upper;
  return 'DEFAULT';
}

function mergedImgSx(imgSx: ReviewPresentationImageProps['imgSx'], repeat: boolean) {
  return {
    ...((typeof imgSx === 'object' && !Array.isArray(imgSx) ? imgSx : {}) as object),
    ...(repeat ? { filter: 'grayscale(1)', opacity: 0.55 } : undefined),
  };
}

export default function ReviewPresentationImage({
  imageUid,
  presentationType,
  thumbnail = true,
  alt = '',
  aspectRatio = 2 / 3,
  fit = 'contain',
  sx,
  imgSx,
}: ReviewPresentationImageProps) {
  const type = normalizePresentationType(presentationType);

  if (type === 'REPLACED') {
    return (
      <Box
        sx={[
          {
            position: 'relative',
            width: '100%',
            flexShrink: 0,
            borderRadius: 1,
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
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        <SmartImage
          imageUid={imageUid}
          thumbnail={thumbnail}
          alt={alt}
          aspectRatio={aspectRatio}
          fit={fit}
          sx={{ width: '100%', height: '100%', aspectRatio: 'unset' }}
          imgSx={mergedImgSx(imgSx, false)}
        />
      </Box>
    );
  }

  return (
    <SmartImage
      imageUid={imageUid}
      thumbnail={thumbnail}
      alt={alt}
      aspectRatio={aspectRatio}
      fit={fit}
      sx={sx}
      imgSx={mergedImgSx(imgSx, type === 'REPEAT')}
    />
  );
}
