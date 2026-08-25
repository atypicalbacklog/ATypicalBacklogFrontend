import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';
import {
  isColumnWidePresentation,
  YEARLY_REVIEW_DEFAULT_CARD_HEIGHT,
  YEARLY_REVIEW_DEFAULT_CARD_HEIGHT_COMPACT,
  YEARLY_REVIEW_DEFAULT_CARD_WIDTH,
  YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT,
} from './yearlyReviewGamePresentationUtils';

interface Props {
  game: YearlyReviewGameDto;
  onEdit?: () => void;
  compact?: boolean;
}

function cardShellSx(onEdit?: () => void): SxProps<Theme> {
  return {
    flexShrink: 0,
    cursor: onEdit ? 'pointer' : 'default',
    overflow: 'hidden',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
    border: '2px solid',
    borderColor: 'divider',
    borderRadius: 1,
  };
}

/**
 * Text-only category entry (no game / additional image).
 * DEFAULT: fixed card size. COLUMN_WIDE: full column width, height follows text.
 */
export default function TextOnlyYearlyReviewCard({
  game,
  onEdit,
  compact = false,
}: Props) {
  const columnWide = isColumnWidePresentation(game.presentationType);
  const cardWidth = compact
    ? YEARLY_REVIEW_DEFAULT_CARD_WIDTH_COMPACT
    : YEARLY_REVIEW_DEFAULT_CARD_WIDTH;
  const cardHeight = compact
    ? YEARLY_REVIEW_DEFAULT_CARD_HEIGHT_COMPACT
    : YEARLY_REVIEW_DEFAULT_CARD_HEIGHT;

  return (
    <Box
      onClick={onEdit}
      sx={{
        ...cardShellSx(onEdit),
        ...(columnWide
          ? {
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              minHeight: 0,
            }
          : {
              width: compact ? '100%' : cardWidth,
              maxWidth: compact ? '100%' : cardWidth,
              height: cardHeight,
            }),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {game.text ? (
        <Box
          sx={{
            flex: columnWide ? '0 0 auto' : '1 1 0',
            minHeight: 0,
            display: 'flex',
            alignItems: columnWide ? 'flex-start' : 'center',
            justifyContent: columnWide ? 'flex-start' : 'center',
            overflow: columnWide ? 'visible' : 'hidden',
            px: compact ? 0.75 : 1.25,
            py: compact ? 0.75 : 1.25,
          }}
        >
          <Typography
            color="text.secondary"
            sx={{
              width: '100%',
              maxHeight: columnWide ? 'none' : '100%',
              fontSize: columnWide ? '1rem' : compact ? '0.85rem' : '0.95rem',
              lineHeight: 1.45,
              overflow: columnWide ? 'visible' : 'hidden',
              textAlign: 'left',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
            title={game.text}
          >
            {game.text}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
