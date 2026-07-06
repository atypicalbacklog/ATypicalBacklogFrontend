import { Box } from '@mui/material';
import { pickDefaultInstance } from '../backlog/instanceDisplay';
import type { BacklogOverviewGameDto } from '../backlog/types';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
import FeedCaptionCardFrame from './FeedCaptionCardFrame';
import FeedCardTooltip from './FeedCardTooltip';
import PlaythroughBorderCard from './PlaythroughBorderCard';
import { LANDING_CAPTION_CARD_IMAGE_HEIGHT } from './landingFeedConstants';

interface Props {
  item: BacklogOverviewGameDto;
}

export default function BacklogFeedCard({ item }: Props) {
  const instance = pickDefaultInstance(item.instances);
  const hasInstance = instance != null;

  const imageUid = hasInstance
    ? (instance.coverImageUid ?? item.coverImageUid)
    : item.coverImageUid;
  const displayName = hasInstance
    ? (instance.instanceName ?? item.gameName)
    : item.gameName;
  const releaseDate = hasInstance
    ? (instance.releaseDate ?? item.gameReleaseDate)
    : item.gameReleaseDate;
  const backlogReason = item.backlogReason?.trim() || null;

  const imageBorderKind = item.hasActivePlaythrough
    ? 'active'
    : item.hasAnyPlaythrough
      ? 'inactive'
      : 'none';

  const tooltipTitle = (
    <Box component="span" sx={{ display: 'block' }}>
      <Box component="span" sx={{ display: 'block', fontWeight: 600 }}>
        {displayName}
      </Box>
      {releaseDate != null && (
        <Box component="span" sx={{ display: 'block', mt: 0.25, opacity: 0.9 }}>
          Release: {releaseDate}
        </Box>
      )}
      {backlogReason != null && (
        <Box component="span" sx={{ display: 'block', mt: 0.25, opacity: 0.9 }}>
          {backlogReason}
        </Box>
      )}
    </Box>
  );

  return (
    <FeedCardTooltip title={tooltipTitle}>
      <FeedCaptionCardFrame>
        <PlaythroughBorderCard kind={imageBorderKind} borderRadius={0}>
          <SmartImage
            imageUid={imageUid}
            thumbnail
            alt=""
            aspectRatio={2 / 3}
            fit="contain"
            sx={{
              width: '100%',
              height: LANDING_CAPTION_CARD_IMAGE_HEIGHT,
              borderRadius: 0,
              aspectRatio: 'unset',
            }}
            imgSx={{ borderRadius: 0 }}
          />
        </PlaythroughBorderCard>
        <Box sx={{ px: 1, py: 0.75, minWidth: 0 }}>
          <DateWithIcon
            date={item.backlogAddedDate}
            tooltip="Added to backlog"
            variant="body2"
            iconSize={14}
          />
        </Box>
      </FeedCaptionCardFrame>
    </FeedCardTooltip>
  );
}

