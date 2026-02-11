import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import type { ReviewByUidDto } from '../../../types/dto';

const PREVIEW_LENGTH = 120;
/** ~100 characters at small font */
const CARD_WIDTH = 420;
const CARD_WIDTH_EXPANDED = Math.round(CARD_WIDTH * 1.5);
const TIER_COLUMN_WIDTH = 56;

const CARD_TRANSITION = 'width 0.3s ease-in-out, min-height 0.3s ease-in-out';
const TEXT_BLOCK_COLLAPSED_MAX_HEIGHT = '7rem';
const TEXT_BLOCK_EXPANDED_MAX_HEIGHT = '70vh';

/** Type priority for picking primary review in a date group: Solo > Coop > Multiplayer > Casual > other. */
const TYPE_PRIORITY_ORDER = ['Solo', 'Coop', 'Multiplayer', 'Casual'];

function getTypePriority(typeNameStr: string): number {
  const i = TYPE_PRIORITY_ORDER.findIndex(
    (t) => t.toLowerCase() === (typeNameStr ?? '').toLowerCase()
  );
  return i >= 0 ? i : TYPE_PRIORITY_ORDER.length;
}

interface Props {
  reviews: ReviewByUidDto[];
  gameInstanceUid: string;
  typeName: (uid: string | null) => string;
  stateName: (uid: string) => string;
  tierName: (uid: string | null) => string;
  getTierColor: (tierUid: string | null) => string;
}

/** Sort by reviewDate desc (newest first); null dates last. */
function sortByNewest(reviews: ReviewByUidDto[]): ReviewByUidDto[] {
  return [...reviews].sort((a, b) => {
    const da = a.reviewDate ?? '';
    const db = b.reviewDate ?? '';
    if (da === db) return 0;
    if (da === '') return 1;
    if (db === '') return -1;
    return db.localeCompare(da);
  });
}

/**
 * Group by date. One card per date. Primary = the one with text (if any), chosen by type priority
 * (Solo > Coop > Multiplayer > Casual > other). If none have text, primary = highest priority type.
 * All others in the same date group are shown in that card as secondary entries.
 */
function buildCardRows(
  reviews: ReviewByUidDto[],
  typeName: (uid: string | null) => string
): { primary: ReviewByUidDto; others: ReviewByUidDto[] }[] {
  const sorted = sortByNewest(reviews);
  const byDate = new Map<string, ReviewByUidDto[]>();
  for (const r of sorted) {
    const key = r.reviewDate ?? '__null__';
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(r);
  }
  const rows: { primary: ReviewByUidDto; others: ReviewByUidDto[] }[] = [];
  const dateKeys = Array.from(byDate.keys()).sort((a, b) => {
    if (a === '__null__') return 1;
    if (b === '__null__') return -1;
    return b.localeCompare(a);
  });
  for (const key of dateKeys) {
    const group = byDate.get(key)!;
    const withText = group.filter((r) => (r.text?.trim().length ?? 0) > 0);
    const candidates = withText.length > 0 ? withText : group;
    candidates.sort(
      (a, b) =>
        getTypePriority(typeName(a.linkedPlaythrough.playthroughTypeUid)) -
        getTypePriority(typeName(b.linkedPlaythrough.playthroughTypeUid))
    );
    const primary = candidates[0];
    const others = group.filter((r) => r.reviewUid !== primary.reviewUid);
    rows.push({ primary, others });
  }
  return rows;
}

export default function ReviewOverviewBlock({
  reviews,
  gameInstanceUid,
  typeName,
  stateName,
  tierName,
  getTierColor,
}: Props) {
  const cardRows = useMemo(() => buildCardRows(reviews, typeName), [reviews, typeName]);

  if (reviews.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No reviews for this instance.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Reviews
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 1 },
        }}
      >
        {cardRows.map(({ primary, others }) => (
          <ReviewCard
            key={primary.reviewUid}
            primary={primary}
            others={others}
            gameInstanceUid={gameInstanceUid}
            typeName={typeName}
            stateName={stateName}
            tierName={tierName}
            getTierColor={getTierColor}
          />
        ))}
      </Box>
    </Box>
  );
}

interface ReviewCardProps {
  primary: ReviewByUidDto;
  others: ReviewByUidDto[];
  gameInstanceUid: string;
  typeName: (uid: string | null) => string;
  stateName: (uid: string) => string;
  tierName: (uid: string | null) => string;
  getTierColor: (tierUid: string | null) => string;
}

function ReviewCard({
  primary,
  others,
  gameInstanceUid,
  typeName,
  stateName,
  tierName,
  getTierColor,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tierUid = primary.tierUid;
  const tierLabel = tierName(tierUid);
  const dateLabel = primary.reviewDate ?? '—';
  const tierBg = getTierColor(tierUid);
  const hasMoreText = (primary.text?.length ?? 0) > PREVIEW_LENGTH;
  const textPreview = primary.text
    ? expanded
      ? primary.text
      : primary.text.slice(0, PREVIEW_LENGTH) + (primary.text.length > PREVIEW_LENGTH ? '…' : '')
    : null;

  const primaryMain = `${typeName(primary.linkedPlaythrough.playthroughTypeUid)} – ${stateName(primary.linkedPlaythrough.playthroughStateUid)}`;
  const groupedLabels =
    others.length > 0
      ? others
          .map(
            (r) =>
              `${typeName(r.linkedPlaythrough.playthroughTypeUid)} – ${stateName(r.linkedPlaythrough.playthroughStateUid)}`
          )
          .join(', ')
      : null;

  const cardWidth = expanded ? CARD_WIDTH_EXPANDED : CARD_WIDTH;

  return (
    <Card
      variant="outlined"
      sx={{
        flexShrink: 0,
        width: cardWidth,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        transition: CARD_TRANSITION,
      }}
    >
      <Box
        sx={{
          width: TIER_COLUMN_WIDTH,
          flexShrink: 0,
          bgcolor: tierBg,
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.95rem',
          fontFamily: 'sans-serif',
          letterSpacing: 0.3,
          p: 0.5,
          textAlign: 'center',
        }}
      >
        {tierLabel || '—'}
      </Box>
      <CardContent sx={{ flex: 1, minWidth: 0, '&:last-child': { pb: 2 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {dateLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
          {primaryMain}
          {groupedLabels && (
            <Box component="span" sx={{ fontStyle: 'italic', fontSize: '0.75rem', ml: 0.5 }}>
              ({groupedLabels})
            </Box>
          )}
        </Typography>
        {textPreview && (
          <Box
            sx={{
              maxHeight: expanded ? TEXT_BLOCK_EXPANDED_MAX_HEIGHT : TEXT_BLOCK_COLLAPSED_MAX_HEIGHT,
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-in-out',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                mb: 1,
                mt: 0.5,
                fontSize: '0.8125rem',
              }}
              component="div"
            >
              {textPreview}
              {hasMoreText && (
                <MuiLink
                  component="button"
                  variant="body2"
                  onClick={() => setExpanded((e) => !e)}
                  sx={{ display: 'block', mt: 0.5, fontSize: '0.8rem' }}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </MuiLink>
              )}
            </Typography>
          </Box>
        )}
        <Typography
          component={Link}
          to="/reviews/edit"
          state={{
            reviewUid: primary.reviewUid,
            from: 'game-instance' as const,
            gameInstanceUid,
          }}
          variant="body2"
          sx={{ display: 'block', mt: 0.25 }}
        >
          Edit review
        </Typography>
      </CardContent>
    </Card>
  );
}
