import { Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { PublicRandomBacklogRecommendationFeedItemDto } from '../../types/feedDto';
import SmartImage from '../shared/SmartImage';
import FeedCaptionCardFrame from './FeedCaptionCardFrame';
import FeedCardTooltip from './FeedCardTooltip';
import PlaythroughBorderCard from './PlaythroughBorderCard';
import { LANDING_CAPTION_CARD_IMAGE_HEIGHT } from './landingFeedConstants';

const BADGE_SX = {
  borderRadius: 1,
  px: 0.625,
  py: 0.2,
  fontSize: '0.8125rem',
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

interface Props {
  item: PublicRandomBacklogRecommendationFeedItemDto;
}

export default function BacklogSubmissionFeedCard({ item }: Props) {
  const releaseDate = item.gameRecommendation?.releaseDate ?? null;

  const tooltipTitle = (
    <Box component="span" sx={{ display: 'block' }}>
      <Box component="span" sx={{ display: 'block', fontWeight: 600 }}>
        {item.name}
      </Box>
      {releaseDate != null ? (
        <Box component="span" sx={{ display: 'block', mt: 0.25, opacity: 0.9 }}>
          Release: {releaseDate}
        </Box>
      ) : null}
    </Box>
  );

  return (
    <FeedCardTooltip title={tooltipTitle}>
      <FeedCaptionCardFrame>
        <Box sx={{ position: 'relative' }}>
          <PlaythroughBorderCard kind="none" borderRadius={0}>
            <SmartImage
              imageUid={item.imageUid}
              thumbnail
              alt=""
              aspectRatio={2 / 3}
              fit="contain"
              placeholderLabel={item.name}
              sx={{
                width: '100%',
                height: LANDING_CAPTION_CARD_IMAGE_HEIGHT,
                borderRadius: 0,
                aspectRatio: 'unset',
              }}
              imgSx={{ borderRadius: 0 }}
            />
          </PlaythroughBorderCard>
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              right: 4,
              zIndex: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                ...BADGE_SX,
                bgcolor: 'rgba(0,0,0,0.65)',
                color: 'grey.400',
              }}
            >
              #{item.voteRank}
            </Box>
            <Box
              sx={{
                ...BADGE_SX,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                bgcolor: 'rgba(0,0,0,0.65)',
                color: '#fff',
              }}
            >
              <ArrowUpwardIcon sx={{ fontSize: 14 }} />
              {item.voteCount}
            </Box>
          </Box>
        </Box>
      </FeedCaptionCardFrame>
    </FeedCardTooltip>
  );
}
