import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CompletionBar from '../shared/CompletionBar';
import PlaythroughTypeWithIcon from '../shared/PlaythroughTypeWithIcon';
import DateWithIcon from '../shared/DateWithIcon';
import { ReviewsApi } from '../../services/reviewsApi';
import { getTimeBookingsByPlaythrough } from '../../services/timeBookingApi';
import { totalDurationSeconds } from '../gameInstances/overview/timeBookingUtils';
import { formatPlaytime } from '../library/formatPlaytime';
import { getTierColorByIndex } from '../../constants/tierColors';
import { getAppConfig } from '../../app/AppConfig';
import { createGameInstanceReturnState, gameInstanceTo } from '../gameInstances/gameInstanceNavigation';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { ReviewSearchResultDto, ReviewByUidDto } from '../../types/dto';
import ReviewModalHeader from './ReviewModalHeader';
import {
  normalizeReviewPresentationType,
  pickPrimaryReviewPlaythrough,
} from './reviewPresentationUtils';

interface Props {
  card: ReviewSearchResultDto;
  open: boolean;
  onClose: () => void;
}

/** Type priority for choosing a primary review: Solo > Coop > Multiplayer > Casual > other. */
const TYPE_PRIORITY_ORDER = ['Solo', 'Coop', 'Multiplayer', 'Casual'];

export default function ReviewDetailModal({ card, open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { referenceData } = useReferenceData();
  const isManagement = getAppConfig().mode === 'MANAGEMENT';

  const [reviewsByUid, setReviewsByUid] = useState<Record<string, ReviewByUidDto>>({});
  const [history, setHistory] = useState<ReviewByUidDto[]>([]);
  const [historyPlaytime, setHistoryPlaytime] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const gameInstanceUid = card.playthroughs[0]?.gameInstanceUid ?? null;

  const goToGameDetail = () => {
    if (!gameInstanceUid) return;
    onClose();
    navigate(gameInstanceTo(gameInstanceUid, createGameInstanceReturnState(location)));
  };

  const data = referenceData?.data;
  const typeName = (u: string | null) =>
    (u && data?.playthroughTypes.find((t) => t.uid === u)?.name) || (u ? u : '—');
  const stateName = (u: string | null) =>
    (u && data?.playthroughStates.find((s) => s.uid === u)?.name) || (u ? u : '—');
  const inputName = (u: string | null) =>
    (u && data?.inputs.find((i) => i.uid === u)?.name) || (u ? u : '—');
  const completionStateName = (u: string | null) =>
    (u && data?.completionStates.find((c) => c.uid === u)?.name) || (u ? u : '—');
  const tiers = useMemo(
    () => (data?.tiers ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data]
  );
  const tierName = (u: string | null) =>
    u ? tiers.find((t) => t.uid === u)?.name ?? u : null;
  const tierColor = (u: string | null) => {
    const idx = u != null ? tiers.findIndex((t) => t.uid === u) : -1;
    return getTierColorByIndex(idx >= 0 ? idx : 0);
  };

  useEffect(() => {
    if (!open || !gameInstanceUid) return;
    let cancelled = false;
    setLoading(true);

    ReviewsApi.getByGameInstance(gameInstanceUid)
      .then(async (reviews) => {
        if (cancelled) return;
        const map: Record<string, ReviewByUidDto> = {};
        reviews.forEach((r) => {
          map[r.reviewUid] = r;
        });
        setReviewsByUid(map);
        setHistory(reviews);

        // Seed known playtimes from the card; fetch the rest by linked playthrough.
        const known: Record<string, number> = {};
        card.playthroughs.forEach((p) => {
          known[p.playthroughUid] = p.totalPlaytimeSeconds;
        });
        const missing = reviews
          .map((r) => r.linkedPlaythrough.uid)
          .filter((uid) => !(uid in known));
        const fetched = await Promise.all(
          missing.map((uid) =>
            getTimeBookingsByPlaythrough(uid)
              .then((bookings) => [uid, totalDurationSeconds(bookings)] as const)
              .catch(() => [uid, 0] as const)
          )
        );
        if (cancelled) return;
        fetched.forEach(([uid, sec]) => {
          known[uid] = sec;
        });
        setHistoryPlaytime(known);
      })
      .catch(() => {
        if (cancelled) return;
        setReviewsByUid({});
        setHistory([]);
        setHistoryPlaytime({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, gameInstanceUid, card]);

  const headerImageUid =
    card.playthroughs.find((p) => p.preferredImageUid)?.preferredImageUid ??
    card.playthroughs.find((p) => p.coverImageUid)?.coverImageUid ??
    card.thumbnailImageUid;

  // Selected review tier (shown once at top): first playthrough with a tier.
  const topTierUid = card.playthroughs.find((p) => p.tierUid)?.tierUid ?? null;

  // Review history excludes the playthroughs grouped within this current card.
  const cardPlaythroughUids = useMemo(
    () => new Set(card.playthroughs.map((p) => p.playthroughUid)),
    [card]
  );
  const otherHistory = history.filter(
    (r) => !cardPlaythroughUids.has(r.linkedPlaythrough.uid)
  );

  const playthroughsByPlaytime = useMemo(
    () =>
      [...card.playthroughs].sort(
        (a, b) => b.totalPlaytimeSeconds - a.totalPlaytimeSeconds
      ),
    [card.playthroughs]
  );

  // Base game completion is shared across the grouped playthroughs → show once at top.
  const baseCompletion =
    card.playthroughs.map((p) => p.completions.find((c) => !c.dlcUid)).find(Boolean) ?? null;
  const anyActive = card.playthroughs.some(
    (p) => stateName(p.playthroughStateUid).toLowerCase() === 'active'
  );

  // Distinct written reviews (a shared review across types is shown once, with the types it covers).
  const writtenReviewGroups = useMemo(() => {
    const typePriority = (typeUid: string | null) => {
      const name =
        (typeUid && data?.playthroughTypes.find((t) => t.uid === typeUid)?.name) || '';
      const i = TYPE_PRIORITY_ORDER.findIndex((t) => t.toLowerCase() === name.toLowerCase());
      return i >= 0 ? i : TYPE_PRIORITY_ORDER.length;
    };
    const sorted = [...card.playthroughs].sort(
      (a, b) => typePriority(a.playthroughTypeUid) - typePriority(b.playthroughTypeUid)
    );
    const groups = new Map<
      string,
      { text: string; date: string | null; typeUids: (string | null)[] }
    >();
    sorted.forEach((p) => {
      if (!p.reviewUid) return;
      const rev = reviewsByUid[p.reviewUid];
      const text = rev?.text?.trim();
      if (!text) return;
      const existing = groups.get(text);
      if (existing) existing.typeUids.push(p.playthroughTypeUid);
      else groups.set(text, { text, date: rev.reviewDate, typeUids: [p.playthroughTypeUid] });
    });
    return Array.from(groups.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, reviewsByUid, data]);

  const primaryPlaythrough = pickPrimaryReviewPlaythrough(card.playthroughs, typeName);
  const headerPresentationType = normalizeReviewPresentationType(
    primaryPlaythrough?.presentationType ??
      card.playthroughs.find((p) => p.presentationType)?.presentationType
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <ReviewModalHeader
          tierUid={topTierUid}
          displayName={card.displayName}
          imageUid={headerImageUid}
          presentationType={headerPresentationType}
          belowTitle={
            baseCompletion ? (
              <CompletionBar
                size={isMobile ? 'small' : undefined}
                completionState={completionStateName(baseCompletion.completionStateUid)}
                playthroughState={anyActive ? 'Active' : null}
              />
            ) : undefined
          }
          showGameDetailButton={isManagement}
          gameInstanceUid={gameInstanceUid}
          onGameDetail={goToGameDetail}
        />
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Review text */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Review
        </Typography>
        {writtenReviewGroups.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No written review.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {writtenReviewGroups.map((group) => (
              <Box key={group.text}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary">
                    {group.typeUids.map((u) => typeName(u)).join(', ')}
                  </Typography>
                  {group.date ? (
                    <DateWithIcon date={group.date} tooltip="Review Date" variant="caption" />
                  ) : null}
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>
                  {group.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Playthrough info */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Playthroughs
        </Typography>
        <Stack spacing={1.5}>
          {playthroughsByPlaytime.map((p) => {
            const completionByDlcUid = new Map(
              p.completions.filter((c) => c.dlcUid).map((c) => [c.dlcUid as string, c])
            );
            return (
              <Box
                key={p.playthroughUid}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                  <PlaythroughTypeWithIcon
                    typeName={typeName(p.playthroughTypeUid)}
                    size="small"
                  />
                  <Typography variant="body2" fontWeight="medium">
                    – {stateName(p.playthroughStateUid)}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 0.5 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Playtime: {formatPlaytime(p.totalPlaytimeSeconds)}
                  </Typography>
                  <DateWithIcon date={p.startedAt} tooltip="Started" variant="body2" />
                  <Typography variant="body2" color="text.secondary">
                    Input: {inputName(p.inputUid)}
                  </Typography>
                </Stack>
                {p.linkedDlcs.map((dlc) => {
                  const comp = completionByDlcUid.get(dlc.uid);
                  return (
                    <Stack
                      key={dlc.uid}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 0.75 }}
                    >
                      <Typography variant="body2">{dlc.name}</Typography>
                      <CompletionBar
                        completionState={completionStateName(comp?.completionStateUid ?? null)}
                        playthroughState={null}
                        size="small"
                      />
                    </Stack>
                  );
                })}
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Review history (all reviews for this instance) with playtimes */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Review history
        </Typography>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : otherHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No other reviews for this instance.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 1 },
            }}
          >
            {otherHistory.map((r) => (
              <Box
                key={r.reviewUid}
                sx={{
                  flexShrink: 0,
                  width: 180,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    flexShrink: 0,
                    bgcolor: tierColor(r.tierUid),
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'center',
                  }}
                >
                  {tierName(r.tierUid) || '—'}
                </Box>
                <Box sx={{ p: 1, minWidth: 0 }}>
                  <DateWithIcon
                    date={r.reviewDate}
                    tooltip="Review Date"
                    variant="caption"
                  />
                  <Typography variant="body2" noWrap>
                    {typeName(r.linkedPlaythrough.playthroughTypeUid)} –{' '}
                    {stateName(r.linkedPlaythrough.playthroughStateUid)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPlaytime(historyPlaytime[r.linkedPlaythrough.uid] ?? 0)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
