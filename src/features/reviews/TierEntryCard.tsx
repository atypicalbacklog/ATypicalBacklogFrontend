import { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotesIcon from '@mui/icons-material/Notes';
import ListIcon from '@mui/icons-material/List';
import ReviewPresentationImage from '../shared/ReviewPresentationImage';
import ReviewDetailModal from './ReviewDetailModal';
import {
  pickPrimaryReviewPlaythrough,
  normalizeReviewPresentationType,
  reviewCardTooltip,
} from './reviewPresentationUtils';
import type { ReviewSearchResultDto } from '../../types/dto';
import type { EditReviewLocationState } from './EditReviewPage';

interface Props {
  card: ReviewSearchResultDto;
  playthroughTypeNames: (uid: string | null) => string;
  onDragStart: (card: ReviewSearchResultDto | null) => void;
  onEdit?: (state: EditReviewLocationState) => void;
  isDragging?: boolean;
  /** When true, use smaller card size (for smartphone). */
  compact?: boolean;
  /** Tiers for "Move to tier" menu (touch fallback when compact). */
  tiers?: { uid: string; name: string }[];
  /** Called when user selects a tier from the move menu (touch fallback). */
  onMoveToTier?: (card: ReviewSearchResultDto, tierUid: string) => void;
}

export default function TierEntryCard({
  card,
  playthroughTypeNames,
  onDragStart,
  onEdit,
  isDragging,
  compact = false,
  tiers,
  onMoveToTier,
}: Props) {
  const [moveAnchor, setMoveAnchor] = useState<null | HTMLElement>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const types = [...new Set(card.playthroughs.map((p) => p.playthroughTypeUid).filter(Boolean))];
  const typeLabels = types.map((uid) => playthroughTypeNames(uid)).filter(Boolean).join(', ') || '—';
  const preferredForEdit = pickPrimaryReviewPlaythrough(card.playthroughs, playthroughTypeNames);
  const hasTextReview = card.playthroughs.some((p) => p.hasTextReview);

  const displayImageUid =
    preferredForEdit?.preferredImageUid ??
    card.playthroughs.find((p) => p.preferredImageUid)?.preferredImageUid ??
    card.thumbnailImageUid;
  const presentationType = normalizeReviewPresentationType(
    preferredForEdit?.presentationType ??
      card.playthroughs.find((p) => p.presentationType)?.presentationType
  );

  const cardWidth = compact ? 100 : 155;
  const imageHeight = compact ? 135 : 210;

  return (
    <>
    <Box
      draggable={!compact}
      onDragStart={
        !compact
          ? (e) => {
              e.dataTransfer.setData('application/json', JSON.stringify({ card }));
              e.dataTransfer.effectAllowed = 'move';
              onDragStart(card);
            }
          : undefined
      }
      onDragEnd={!compact ? () => onDragStart(null) : undefined}
      onClick={() => setDetailOpen(true)}
      title={reviewCardTooltip(card.displayName, presentationType)}
      sx={{
        flexShrink: 0,
        width: cardWidth,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        boxShadow: 1,
        border: 1,
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create('border-color', {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': {
          borderColor: 'primary.main',
        },
        opacity: isDragging ? 0.5 : 1,
        cursor: compact ? 'default' : 'grab',
        '&:active': compact ? undefined : { cursor: 'grabbing' },
        position: 'relative',
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
      <Box sx={{ p: 1, pb: 4, textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
        <Typography variant="caption" color="text.secondary" noWrap title={typeLabels}>
          {typeLabels}
        </Typography>
      </Box>
      {preferredForEdit && onEdit && (
        <Box
          sx={{
            position: 'absolute',
            left: 4,
            bottom: 4,
            zIndex: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit({ reviewUid: preferredForEdit.reviewUid!, from: 'tierlist' });
            }}
            aria-label="Edit review"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {hasTextReview && (
        <Box
          sx={{
            position: 'absolute',
            right: 4,
            bottom: 4,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            bgcolor: 'background.paper',
            borderRadius: '50%',
            width: 20,
            height: 20,
            boxShadow: 1,
          }}
        >
          <NotesIcon fontSize="small" />
        </Box>
      )}
      {compact && tiers && tiers.length > 0 && onMoveToTier && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMoveAnchor(e.currentTarget);
            }}
            aria-label="Move to tier"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <ListIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={moveAnchor}
            open={Boolean(moveAnchor)}
            onClose={() => setMoveAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {tiers.map((tier) => (
              <MenuItem
                key={tier.uid}
                onClick={() => {
                  onMoveToTier(card, tier.uid);
                  setMoveAnchor(null);
                }}
              >
                {tier.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}
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

