import { Box, IconButton, Typography } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import EditIcon from '@mui/icons-material/Edit';
import SmartImage from '../shared/SmartImage';
import type { ReviewSearchResultDto, ReviewSearchPlaythroughDto } from '../../types/dto';
import type { EditReviewLocationState } from './EditReviewPage';

/** Preferred playthrough type order for opening edit: Solo > Coop > Multiplayer > Casual > other. */
const EDIT_TYPE_ORDER = ['Solo', 'Coop', 'Multiplayer', 'Casual'];

function pickReviewPlaythroughForEdit(
  card: ReviewSearchResultDto,
  playthroughTypeName: (uid: string | null) => string
): ReviewSearchPlaythroughDto | undefined {
  const withReview = card.playthroughs.filter((p) => p.reviewUid);
  if (withReview.length === 0) return undefined;
  const typeOrderIndex = (p: ReviewSearchPlaythroughDto) => {
    const name = playthroughTypeName(p.playthroughTypeUid);
    const i = EDIT_TYPE_ORDER.findIndex((t) => t.toLowerCase() === name.toLowerCase());
    return i >= 0 ? i : EDIT_TYPE_ORDER.length;
  };
  withReview.sort((a, b) => typeOrderIndex(a) - typeOrderIndex(b));
  return withReview[0];
}

export interface TierEntryCardProps {
  card: ReviewSearchResultDto;
  playthroughTypeNames: (uid: string | null) => string;
  onDragStart: (card: ReviewSearchResultDto | null) => void;
  onEdit?: (state: EditReviewLocationState) => void;
  isDragging?: boolean;
}

export default function TierEntryCard({
  card,
  playthroughTypeNames,
  onDragStart,
  onEdit,
  isDragging,
}: TierEntryCardProps) {
  const types = [...new Set(card.playthroughs.map((p) => p.playthroughTypeUid).filter(Boolean))];
  const typeLabels = types.map((uid) => playthroughTypeNames(uid)).filter(Boolean).join(', ') || '—';
  const preferredForEdit = pickReviewPlaythroughForEdit(card, playthroughTypeNames);
  const hasTextReview = card.playthroughs.some((p) => p.hasTextReview);

  return (
    <Box
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ card }));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(card);
      }}
      onDragEnd={() => onDragStart(null)}
      title={card.displayName}
      sx={{
        flexShrink: 0,
        width: 155,
        pb: 1,
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
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        position: 'relative',
      }}
    >
      <SmartImage
        imageUid={card.thumbnailImageUid}
        thumbnail
        alt=""
        aspectRatio={2 / 3}
        fit="contain"
        sx={{ width: '100%', height: 210 }}
      />
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
    </Box>
  );
}

