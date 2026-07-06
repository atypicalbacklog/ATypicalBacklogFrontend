import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import SmartImage from '../shared/SmartImage';
import FeedCardTooltip from './FeedCardTooltip';
import PlaythroughBorderCard, { type PlaythroughBorderKind } from './PlaythroughBorderCard';
import {
  LANDING_CARD_IMAGE_HEIGHT,
  LANDING_CARD_WIDTH,
} from './landingFeedConstants';

interface Props {
  imageUid: string | null;
  title: string;
  caption?: ReactNode;
  onClick?: () => void;
  topBadge?: ReactNode;
  imageBorderKind?: PlaythroughBorderKind;
}

export default function FeedGameCard({
  imageUid,
  title,
  caption,
  onClick,
  topBadge,
  imageBorderKind = 'none',
}: Props) {
  const tooltipTitle =
    caption != null && caption !== '' ? (
      <Box component="span" sx={{ display: 'block' }}>
        <Box component="span" sx={{ display: 'block', fontWeight: 600 }}>
          {title}
        </Box>
        <Box component="span" sx={{ display: 'block', mt: 0.25, opacity: 0.9 }}>
          {caption}
        </Box>
      </Box>
    ) : (
      title
    );

  const card = (
    <Box
      sx={{
        width: LANDING_CARD_WIDTH,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative' }}>
        {topBadge ? (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              right: 4,
              zIndex: 2,
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            {topBadge}
          </Box>
        ) : null}
        <PlaythroughBorderCard kind={imageBorderKind}>
          <SmartImage
            imageUid={imageUid}
            thumbnail
            alt=""
            aspectRatio={2 / 3}
            fit="contain"
            sx={{
              width: '100%',
              height: LANDING_CARD_IMAGE_HEIGHT,
              borderRadius: 1,
            }}
            imgSx={{ borderRadius: 1 }}
          />
        </PlaythroughBorderCard>
      </Box>
    </Box>
  );

  if (onClick) {
    return card;
  }

  return <FeedCardTooltip title={tooltipTitle}>{card}</FeedCardTooltip>;
}
