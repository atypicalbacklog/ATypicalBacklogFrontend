import { useState } from 'react';
import { Box } from '@mui/material';
import SmartImage from '../shared/SmartImage';
import ReviewDetailModal from './ReviewDetailModal';
import type { ReviewSearchResultDto } from '../../types/dto';

interface Props {
  card: ReviewSearchResultDto;
}

/** Read-only tier card: cover only; tooltip = displayName (instance name or game name). */
export default function TierEntryCardView({ card }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  // Use a review's preferred image when set, falling back to the default thumbnail.
  const displayImageUid =
    card.playthroughs.find((p) => p.preferredImageUid)?.preferredImageUid ??
    card.thumbnailImageUid;

  return (
    <>
      <Box
        title={card.displayName}
        onClick={() => setDetailOpen(true)}
        sx={{
          flexShrink: 0,
          width: 155,
          pb: 1,
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
        <SmartImage
          imageUid={displayImageUid}
          thumbnail
          alt=""
          aspectRatio={2 / 3}
          fit="contain"
          sx={{ width: '100%', height: 210 }}
        />
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
