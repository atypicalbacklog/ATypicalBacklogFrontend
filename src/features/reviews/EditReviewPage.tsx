import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { ReviewsApi } from '../../services/reviewsApi';
import { ImageApi } from '../../services/imageApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import DateField from '../shared/DateField';
import type { ReviewByUidDto } from '../../types/dto';
import SmartImage from '../shared/SmartImage';

/** Pass reviewUid to open edit; page fetches displayName + image from GET /api/reviews/{uid}. */
export interface EditReviewLocationState {
  reviewUid: string;
  /** Entry point for back button: tierlist = year tierlist, game-instance = GameInstanceOverview */
  from?: 'tierlist' | 'game-instance';
  /** When from is 'game-instance', link back to /game-instances/{gameInstanceUid} */
  gameInstanceUid?: string;
}

export default function EditReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as EditReviewLocationState | null;
  const { referenceData, isLoaded } = useReferenceData();

  const [review, setReview] = useState<ReviewByUidDto | null>(null);
  const [loading, setLoading] = useState(!!state?.reviewUid);
  const [tierUid, setTierUid] = useState<string>('');
  const [reviewDate, setReviewDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [text, setText] = useState<string>('');
  const [preferredImageUid, setPreferredImageUid] = useState<string | null>(null);
  const [gameImages, setGameImages] = useState<{ uid: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!state?.reviewUid) return;
    const key = `edit-review-${state.reviewUid}`;
    if (!initialFetchBegin(key)) return;
    setLoading(true);
    setError(null);
    ReviewsApi.getByUid(state.reviewUid)
      .then((data) => {
        setReview(data);
        setTierUid(data.tierUid ?? '');
        setReviewDate(data.reviewDate ?? new Date().toISOString().slice(0, 10));
        setText(data.text ?? '');
        setPreferredImageUid(data.preferredImageUid ?? null);
      })
      .catch(() => setError('Failed to load review.'))
      .finally(() => {
        setLoading(false);
        initialFetchEnd(key);
      });
  }, [state?.reviewUid]);

  useEffect(() => {
    if (!review?.gameUid) {
      setGameImages([]);
      return;
    }
    ImageApi.listByGame(review.gameUid)
      .then((list) => setGameImages(list.map((im) => ({ uid: im.uid }))))
      .catch(() => setGameImages([]));
  }, [review?.gameUid]);

  const tiers = (referenceData?.data?.tiers ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const canSave = !!state?.reviewUid;

  const handleSave = useCallback(async () => {
    if (!state?.reviewUid) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await ReviewsApi.updateReview({
        reviewUid: state.reviewUid,
        reviewDate: reviewDate || null,
        tierUid: tierUid || null,
        text: text.trim() || null,
        preferredImageUid: preferredImageUid,
      });
      setSuccess(true);
    } catch {
      setError('Failed to save review.');
    } finally {
      setSaving(false);
    }
  }, [state?.reviewUid, reviewDate, tierUid, text, preferredImageUid]);

  if (!isLoaded) return null;

  if (!state?.reviewUid) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
        <Typography color="text.secondary" gutterBottom>
          No review selected. Open this page from the year tierlist by choosing a review to edit.
        </Typography>
        <Button onClick={() => navigate('/reviews/year-tierlist')} sx={{ mt: 2 }}>
          Back to Year Tierlist
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!review) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
        <Typography color="error" gutterBottom>
          {error ?? 'Failed to load review.'}
        </Typography>
        <Button onClick={() => navigate('/reviews/year-tierlist')} sx={{ mt: 2 }}>
          Back to Year Tierlist
        </Button>
      </Box>
    );
  }

  const playthroughTypes = referenceData?.data?.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data?.playthroughStates ?? [];
  const typeName = (uid: string | null) =>
    uid ? playthroughTypes.find((t) => t.uid === uid)?.name ?? uid : '—';
  const stateName = (uid: string) =>
    playthroughStates.find((s) => s.uid === uid)?.name ?? uid;
  const linkedLabel = `${typeName(review.linkedPlaythrough.playthroughTypeUid)} – ${stateName(review.linkedPlaythrough.playthroughStateUid)}`;
  const othersLabels =
    review.otherPlaythroughs.length > 0
      ? review.otherPlaythroughs.map(
          (p) => `${typeName(p.playthroughTypeUid)} – ${stateName(p.playthroughStateUid)}`
        )
      : [];

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 3 }}>
      {/* Top: Game name & Image + playthrough Type/State */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
        <SmartImage
          imageUid={review.coverImageUid}
          thumbnail
          alt=""
          aspectRatio={2 / 3}
          fit="contain"
          sx={{ width: 80, height: 80, borderRadius: 1 }}
          imgSx={{ borderRadius: 1 }}
        />
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h1">
            {review.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {linkedLabel}
            {othersLabels.length > 0 && (
              <Box
                component="span"
                sx={{ fontStyle: 'italic', fontSize: '0.85rem', ml: 0.5 }}
              >
                ({othersLabels.join(', ')})
              </Box>
            )}
          </Typography>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tier & Review date */}
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tier</InputLabel>
          <Select
            label="Tier"
            value={tierUid}
            onChange={(e) => setTierUid(e.target.value)}
          >
            <MenuItem value="">—</MenuItem>
            {tiers.map((t) => (
              <MenuItem key={t.uid} value={t.uid}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <DateField
          label="Review date"
          value={reviewDate}
          onChange={setReviewDate}
        />
      </Stack>

      {/* Preferred image (optional) */}
      {gameImages.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Preferred image (optional)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            {gameImages.map((im) => (
              <Box
                key={im.uid}
                onClick={() =>
                  setPreferredImageUid(preferredImageUid === im.uid ? null : im.uid)
                }
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  border: 2,
                  borderColor:
                    preferredImageUid === im.uid ? 'primary.main' : 'divider',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <SmartImage
                  imageUid={im.uid}
                  thumbnail
                  alt=""
                  aspectRatio={1}
                  fit="contain"
                  sx={{ width: '100%', height: '100%' }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Multiline textarea: auto-growing, large width, minimal chrome */}
      <TextField
        multiline
        minRows={8}
        maxRows={24}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Review notes…"
        fullWidth
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            lineHeight: 1.6,
            alignItems: 'flex-start',
          },
          '& .MuiOutlinedInput-input': {
            padding: 2,
          },
          '& fieldset': {
            borderWidth: 1,
          },
        }}
        inputProps={{
          style: { minHeight: 120 },
        }}
      />

      {/* Save button + success text beside + back by entry point */}
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !canSave}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {success && (
          <Typography variant="caption" color="success.main">
            Saved.
          </Typography>
        )}
        {state.from === 'game-instance' && state.gameInstanceUid ? (
          <Link
            component={RouterLink}
            to={`/game-instances/${state.gameInstanceUid}`}
            variant="body2"
            sx={{ ml: 1 }}
          >
            Back to Game
          </Link>
        ) : (
          <Link
            component={RouterLink}
            to="/reviews/year-tierlist"
            variant="body2"
            sx={{ ml: 1 }}
          >
            Back to tierlist view
          </Link>
        )}
      </Stack>
    </Box>
  );
}
