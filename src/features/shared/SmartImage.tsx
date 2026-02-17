import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { getImageUrl } from '../../services/imageApi';

export type SmartImageFit = 'contain' | 'cover';

interface Props {
  imageUid: string | null;
  thumbnail?: boolean;
  alt?: string;
  /** Default is 2:3 vertical cover (width/height = 2/3). */
  aspectRatio?: number;
  /** How the image is fit into the available box. Default: contain. */
  fit?: SmartImageFit;
  /** Alignment inside the box. Default: center. */
  objectPosition?: string;
  /** Render a placeholder box when imageUid is null. Default: true. */
  showPlaceholder?: boolean;
  /** Container styles (width/height should typically be set here). */
  sx?: SxProps<Theme>;
  /** Additional styles for the <img>. */
  imgSx?: SxProps<Theme>;
}

/**
 * Standardized image wrapper for game/cover images:
 * - never overflows its box
 * - uses contain-fit by default (no cropping)
 * - solid letterbox background when aspect ratios don’t match
 * - optional placeholder when there is no image
 */
export default function SmartImage({
  imageUid,
  thumbnail = true,
  alt = '',
  aspectRatio = 2 / 3,
  fit = 'contain',
  objectPosition = 'center',
  showPlaceholder = true,
  sx,
  imgSx,
}: Props) {
  const url = getImageUrl(imageUid, thumbnail);

  if (!url && !showPlaceholder) return null;

  return (
    <Box
      sx={[
        (theme) => ({
          position: 'relative',
          overflow: 'hidden',
          // Solid background for letterboxing / empty space.
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
          // Provide a sensible default aspect ratio when parent doesn't fix height.
          aspectRatio,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {url ? (
        <Box
          component="img"
          src={url}
          alt={alt}
          sx={[
            {
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: fit,
              objectPosition,
              display: 'block',
            },
            ...(Array.isArray(imgSx) ? imgSx : [imgSx]),
          ]}
        />
      ) : null}
    </Box>
  );
}

