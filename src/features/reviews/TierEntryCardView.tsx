import { useState } from 'react';
import { Box } from '@mui/material';
import ReviewPresentationImage from '../shared/ReviewPresentationImage';
import ReviewDetailModal from './ReviewDetailModal';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import {
  pickPrimaryReviewPlaythrough,
  normalizeReviewPresentationType,
  reviewCardTooltip,
} from './reviewPresentationUtils';
import type { ReviewSearchResultDto } from '../../types/dto';

interface Props {
  card: ReviewSearchResultDto;
  /** When true, use smaller card size (for smartphone). */
  compact?: boolean;
}

/** Read-only tier card: cover only; tooltip = display name (+ presentation hint for REPEAT/REPLACED). */
export default function TierEntryCardView({ card, compact = false }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { referenceData } = useReferenceData();
  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const typeName = (uid: string | null) =>
    (uid && playthroughTypes.find((t) => t.uid === uid)?.name) || uid || '—';

  const primary = pickPrimaryReviewPlaythrough(card.playthroughs, typeName);
  const displayImageUid =
    primary?.preferredImageUid ??
    card.playthroughs.find((p) => p.preferredImageUid)?.preferredImageUid ??
    card.thumbnailImageUid;
  const presentationType = normalizeReviewPresentationType(
    primary?.presentationType ??
      card.playthroughs.find((p) => p.presentationType)?.presentationType
  );

  const cardWidth = compact ? 100 : 155;
  const imageHeight = compact ? 135 : 210;

  return (
    <>
      <Box
        title={reviewCardTooltip(card.displayName, presentationType)}
        onClick={() => setDetailOpen(true)}
        sx={{
          flexShrink: 0,
          width: cardWidth,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
          boxShadow: 1,
          border: 1,
          borderColor: 'divider',
          transition: (theme) =>
            theme.transitions.create('border-color', {
              duration: theme.transitions.duration.short,
            }),
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: imageHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <ReviewPresentationImage
            imageUid={displayImageUid}
            presentationType={presentationType}
            thumbnail
            alt=""
            aspectRatio={2 / 3}
            fit="contain"
            sx={{ width: '100%', height: '100%', aspectRatio: 'unset', bgcolor: 'transparent' }}
            imgSx={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        </Box>
      </Box>
      {detailOpen && (
        <ReviewDetailModal
          card={card}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
