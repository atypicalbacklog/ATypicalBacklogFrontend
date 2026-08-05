import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  addBacklogRecommendationComment,
  fetchBacklogRecommendation,
  upvoteBacklogRecommendation,
} from '../../services/backlogRecommendationApi';
import { IgdbApi } from '../../services/igdbApi';
import type { BacklogRecommendationViewDto } from '../../types/backlogRecommendationDto';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
import BacklogSubmissionStateBanner from './BacklogSubmissionStateBanner';
import { getBacklogSubmissionStatePresentation } from './backlogSubmissionStateLabels';
import { recommendationCoverUid, recommendationIgdbCoverUrl } from './recommendationImageUtils';

const HEADER_IMAGE_HEIGHT = 132;
const HEADER_IMAGE_WIDTH = Math.round((HEADER_IMAGE_HEIGHT * 2) / 3) + 8;
const COMMENT_BODY_MAX_HEIGHT = 120;

interface Props {
  uid: string | null;
  /** Rank from list/search context; detail GET may not return a reliable voteRank. */
  listVoteRank?: number | null;
  open: boolean;
  onClose: () => void;
  hasUpvoted: boolean;
  onUpvoted: (uid: string, voteCount: number) => void;
  onCommentsUpdated?: () => void;
}

export default function BacklogSubmissionDetailModal({
  uid,
  listVoteRank,
  open,
  onClose,
  hasUpvoted,
  onUpvoted,
  onCommentsUpdated,
}: Props) {
  const [item, setItem] = useState<BacklogRecommendationViewDto | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [igdbCoverUrl, setIgdbCoverUrl] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!uid) return;
      if (!opts?.silent) setInitialLoading(true);
      setError(null);
      try {
        const data = await fetchBacklogRecommendation(uid);
        setItem(data);
      } catch {
        if (!opts?.silent) {
          setError('Failed to load backlog submission.');
          setItem(null);
        }
      } finally {
        if (!opts?.silent) setInitialLoading(false);
      }
    },
    [uid]
  );

  useEffect(() => {
    if (!open || !uid) {
      setItem(null);
      setCommentDraft('');
      setError(null);
      setIgdbCoverUrl(null);
      setInitialLoading(false);
      return;
    }
    void load();
  }, [open, uid, load]);

  const imageUid = item ? recommendationCoverUid(item) : null;
  const storedIgdbCoverUrl = item ? recommendationIgdbCoverUrl(item) : null;
  const igdbId = item?.gameRecommendation?.externalIgdbId ?? null;
  const releaseDate = item?.gameRecommendation?.releaseDate ?? null;

  useEffect(() => {
    if (!item || imageUid) {
      setIgdbCoverUrl(null);
      return;
    }
    if (storedIgdbCoverUrl) {
      setIgdbCoverUrl(storedIgdbCoverUrl);
      return;
    }
    if (!igdbId) {
      setIgdbCoverUrl(null);
      return;
    }
    const parsed = Number.parseInt(igdbId, 10);
    if (Number.isNaN(parsed)) {
      setIgdbCoverUrl(null);
      return;
    }
    let cancelled = false;
    IgdbApi.getByExternalId(parsed)
      .then((result) => {
        if (!cancelled) setIgdbCoverUrl(result.coverImageUrl);
      })
      .catch(() => {
        if (!cancelled) setIgdbCoverUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [item, imageUid, storedIgdbCoverUrl, igdbId]);

  const statePresentation = item
    ? getBacklogSubmissionStatePresentation(item.state, item.stateReason)
    : null;

  const handleUpvote = async () => {
    if (!uid || !item || hasUpvoted || submitting || !statePresentation?.allowUpvote) return;
    setSubmitting(true);
    setError(null);
    const nextCount = item.voteCount + 1;
    try {
      await upvoteBacklogRecommendation(uid);
      setItem((prev) => (prev ? { ...prev, voteCount: nextCount } : prev));
      onUpvoted(uid, nextCount);
    } catch {
      setError('Failed to upvote.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async () => {
    if (!uid || !commentDraft.trim() || !statePresentation?.allowComment) return;
    setSubmitting(true);
    setError(null);
    try {
      await addBacklogRecommendationComment(uid, commentDraft.trim());
      setCommentDraft('');
      await load({ silent: true });
      onCommentsUpdated?.();
    } catch {
      setError('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayVoteRank = listVoteRank ?? item?.voteRank;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          pr: 6,
          py: 1.25,
          typography: 'subtitle1',
          fontWeight: 600,
        }}
      >
        {displayVoteRank != null
          ? `Backlog submission #${displayVoteRank}`
          : 'Backlog submission'}
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {initialLoading && !item && (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {item && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {igdbCoverUrl && !imageUid ? (
                <Box
                  sx={{
                    width: HEADER_IMAGE_WIDTH,
                    height: HEADER_IMAGE_HEIGHT,
                    flexShrink: 0,
                    borderRadius: 0.5,
                    overflow: 'hidden',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[900]
                        : theme.palette.grey[200],
                  }}
                >
                  <Box
                    component="img"
                    src={igdbCoverUrl}
                    alt=""
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                </Box>
              ) : (
                <SmartImage
                  imageUid={imageUid}
                  thumbnail
                  alt=""
                  placeholderLabel={item.name}
                  fit="cover"
                  sx={{
                    width: HEADER_IMAGE_WIDTH,
                    height: HEADER_IMAGE_HEIGHT,
                    flexShrink: 0,
                    aspectRatio: 'unset',
                    borderRadius: 0.5,
                  }}
                  imgSx={{ borderRadius: 0.5 }}
                />
              )}

              <Stack sx={{ flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'flex-start' }}>
                <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
                  {item.name}
                </Typography>
                {releaseDate ? (
                  <Box sx={{ mt: 0.5 }}>
                    <DateWithIcon date={releaseDate} tooltip="Release date" variant="body2" />
                  </Box>
                ) : null}
                {igdbId ? (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    IGDB {igdbId}
                  </Typography>
                ) : null}
                {item.backlogInfo ? (
                  <Box sx={{ mt: 0.5 }}>
                    <DateWithIcon
                      date={item.backlogInfo.addedDate}
                      tooltip="Since addition to backlog"
                      variant="body2"
                    />
                  </Box>
                ) : null}
              </Stack>

              <Stack
                alignItems="center"
                justifyContent="flex-start"
                sx={{
                  flexShrink: 0,
                  minWidth: 56,
                  alignSelf: 'stretch',
                  pt: 0.25,
                }}
              >
                <Stack alignItems="center" spacing={0.25}>
                  <IconButton
                    size="medium"
                    onClick={() => void handleUpvote()}
                    disabled={
                      hasUpvoted || submitting || statePresentation?.allowUpvote === false
                    }
                    aria-label={hasUpvoted ? 'Upvoted' : 'Upvote'}
                    sx={{
                      color: hasUpvoted ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <ArrowUpwardIcon
                      sx={{
                        fontSize: 28,
                        color: hasUpvoted ? 'primary.main' : 'inherit',
                      }}
                    />
                  </IconButton>
                  <Typography variant="h5" fontWeight={700} lineHeight={1}>
                    {item.voteCount}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {statePresentation?.showBanner &&
            statePresentation.message &&
            statePresentation.border !== 'none' ? (
              <BacklogSubmissionStateBanner
                message={statePresentation.message}
                border={statePresentation.border}
                stateDate={statePresentation.showStateDate ? item.stateDate : null}
              />
            ) : null}

            {item.backlogInfo?.reason ? (
              <Typography variant="body2" color="text.secondary">
                {item.backlogInfo.reason}
              </Typography>
            ) : null}

            {item.comment || item.originalRecommendationBy ? (
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                {item.comment ? (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: '0.6875rem', lineHeight: 1.3, mb: 0.25 }}
                    >
                      Original comment
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.comment}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, minWidth: 0 }} />
                )}
                {item.originalRecommendationBy ? (
                  <Box sx={{ textAlign: 'right', flexShrink: 0, maxWidth: '45%' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: '0.6875rem', lineHeight: 1.3 }}
                    >
                      Recommended by
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ lineHeight: 1.35 }}>
                      {item.originalRecommendationBy}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            ) : null}

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Comments ({item.comments.length})
              </Typography>
              {item.comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No comments yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {item.comments.map((c) => (
                    <Box
                      key={c.uid}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Box
                        sx={{
                          maxHeight: COMMENT_BODY_MAX_HEIGHT,
                          overflowY: 'auto',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            ...(c.flagged
                              ? {
                                  fontStyle: 'italic',
                                  color: (theme) =>
                                    theme.palette.mode === 'dark'
                                      ? 'rgba(200, 155, 155, 0.85)'
                                      : 'rgba(130, 95, 95, 0.9)',
                                }
                              : undefined),
                          }}
                        >
                          {c.comment}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.creationDate).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {statePresentation?.allowComment ? (
              <TextField
                label="Add comment"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                size="small"
              />
            ) : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {statePresentation?.allowComment ? (
          <Button
            variant="contained"
            onClick={() => void handleComment()}
            disabled={!commentDraft.trim() || submitting}
          >
            Post comment
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
