import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import type { ReactNode } from 'react';
import ReviewPresentationImage from '../shared/ReviewPresentationImage';
import { getTierColorByIndex } from '../../constants/tierColors';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { ReviewPresentationType } from '../../types/dto';

interface Props {
  tierUid: string | null;
  displayName: string;
  imageUid: string | null;
  presentationType?: ReviewPresentationType | string | null;
  belowTitle?: ReactNode;
  showYearlyReviewButton?: boolean;
  reviewYear?: number | null;
  gameInstanceUid?: string | null;
  onYearlyReview?: () => void;
  onGameDetail?: () => void;
  showGameDetailButton?: boolean;
  /** Landing modal: game detail button on top, yearly review as text link below. */
  navLayout?: 'default' | 'landing';
}

export default function ReviewModalHeader({
  tierUid,
  displayName,
  imageUid,
  presentationType,
  belowTitle,
  showYearlyReviewButton = false,
  reviewYear = null,
  gameInstanceUid = null,
  onYearlyReview,
  onGameDetail,
  showGameDetailButton = false,
  navLayout = 'default',
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { referenceData } = useReferenceData();

  const tiers = (referenceData?.data.tiers ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const tierLabel =
    tierUid != null ? tiers.find((t) => t.uid === tierUid)?.name ?? null : null;
  const tierIdx = tierUid != null ? tiers.findIndex((t) => t.uid === tierUid) : -1;
  const tierColor = getTierColorByIndex(tierIdx >= 0 ? tierIdx : 0);

  const tierBadgeWidth = isMobile ? 40 : 56;
  const imageWidth = isMobile ? 72 : 100;
  const imageHeight = isMobile ? 108 : 150;

  const tierBadge = tierLabel ? (
    <Box
      sx={{
        width: tierBadgeWidth,
        height: imageHeight,
        flexShrink: 0,
        bgcolor: tierColor,
        color: '#000',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: isMobile ? '0.875rem' : '1.15rem',
        fontFamily: 'sans-serif',
        letterSpacing: 0.3,
        textAlign: 'center',
        px: 0.5,
      }}
    >
      {tierLabel}
    </Box>
  ) : null;

  const coverImage = (
    <ReviewPresentationImage
      imageUid={imageUid}
      presentationType={presentationType}
      thumbnail
      alt=""
      aspectRatio={2 / 3}
      fit="contain"
      sx={{
        width: imageWidth,
        height: imageHeight,
        borderRadius: 1,
        flexShrink: 0,
      }}
      imgSx={{ borderRadius: 1 }}
    />
  );

  const hasNav =
    (showYearlyReviewButton && onYearlyReview) ||
    (showGameDetailButton && onGameDetail);

  const navButtons = hasNav ? (
    navLayout === 'landing' ? (
      <Stack
        spacing={0.5}
        sx={{ flexShrink: 0, alignSelf: 'flex-start', alignItems: 'flex-start' }}
      >
        {showGameDetailButton && onGameDetail ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<SportsEsportsIcon fontSize="small" />}
            disabled={!gameInstanceUid}
            onClick={onGameDetail}
          >
            Game detail
          </Button>
        ) : null}
        {showYearlyReviewButton && onYearlyReview ? (
          <Button
            size="small"
            variant="text"
            startIcon={<CalendarMonthIcon fontSize="small" />}
            disabled={reviewYear == null}
            onClick={onYearlyReview}
            sx={{ minWidth: 0, px: 0.5 }}
          >
            Yearly review{reviewYear != null ? ` (${reviewYear})` : ''}
          </Button>
        ) : null}
      </Stack>
    ) : (
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ flexShrink: 0, alignSelf: 'flex-start' }}
      >
        {showYearlyReviewButton && onYearlyReview ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarMonthIcon fontSize="small" />}
            disabled={reviewYear == null}
            onClick={onYearlyReview}
          >
            Yearly review{reviewYear != null ? ` (${reviewYear})` : ''}
          </Button>
        ) : null}
        {showGameDetailButton && onGameDetail ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<SportsEsportsIcon fontSize="small" />}
            disabled={!gameInstanceUid}
            onClick={onGameDetail}
          >
            Game detail
          </Button>
        ) : null}
      </Stack>
    )
  ) : null;

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {tierBadge}
          {coverImage}
          <Typography variant="h6" sx={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
            {displayName}
          </Typography>
        </Stack>
        {belowTitle ? <Box sx={{ width: '100%', minWidth: 0 }}>{belowTitle}</Box> : null}
        {navButtons}
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      {tierBadge}
      {coverImage}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
          {displayName}
        </Typography>
        {belowTitle ? <Box sx={{ mt: 1 }}>{belowTitle}</Box> : null}
      </Box>
      {navButtons}
    </Stack>
  );
}
