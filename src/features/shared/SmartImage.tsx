import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { getImageUrl } from '../../services/imageApi';
import { getAdditionalImageUrl } from '../../services/additionalImageApi';
import GameImageMissingPlaceholder from './GameImageMissingPlaceholder';

export type SmartImageFit = 'contain' | 'cover';
export type SmartImageKind = 'game' | 'additional';

interface Props {
  imageUid: string | null;
  thumbnail?: boolean;
  /** Default: game (`/api/images`). Use additional for `/api/additional-images`. */
  kind?: SmartImageKind;
  alt?: string;
  /** Default is 2:3 vertical cover (width/height = 2/3). */
  aspectRatio?: number;
  /** How the image is fit into the available box. Default: contain. */
  fit?: SmartImageFit;
  /** Alignment inside the box. Default: center. */
  objectPosition?: string;
  /** Render a placeholder box when imageUid is null. Default: true. */
  showPlaceholder?: boolean;
  /** Shorter missing-image label for small thumbnails. */
  compactPlaceholder?: boolean;
  /** Custom placeholder text when image is missing. */
  placeholderLabel?: string;
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
 * - solid grey + "no image available" when missing or failed to load
 */
export default function SmartImage({
  imageUid,
  thumbnail = true,
  kind = 'game',
  alt = '',
  aspectRatio = 2 / 3,
  fit = 'contain',
  objectPosition = 'center',
  showPlaceholder = true,
  compactPlaceholder = false,
  placeholderLabel,
  sx,
  imgSx,
}: Props) {
  const url =
    kind === 'additional'
      ? getAdditionalImageUrl(imageUid, thumbnail)
      : getImageUrl(imageUid, thumbnail);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [url, imageUid, kind]);

  if (!url && !showPlaceholder) return null;

  const showMissing = !url || loadFailed;

  return (
    <Box
      sx={[
        (theme) => ({
          position: 'relative',
          overflow: 'hidden',
          bgcolor: showMissing
            ? undefined
            : theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[200],
          aspectRatio,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {showMissing ? (
        showPlaceholder ? (
          <GameImageMissingPlaceholder
            compact={compactPlaceholder}
            label={placeholderLabel}
          />
        ) : null
      ) : (
        <Box
          component="img"
          src={url}
          alt={alt}
          onError={() => setLoadFailed(true)}
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
      )}
    </Box>
  );
}
