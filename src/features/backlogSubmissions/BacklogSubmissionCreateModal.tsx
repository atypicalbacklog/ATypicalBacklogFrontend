import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getAppConfig } from '../../app/AppConfig';
import { createBacklogRecommendation } from '../../services/backlogRecommendationApi';
import type { UnifiedGameSearchResultDto } from '../../types/backlogRecommendationDto';
import type { IgdbGameSearchResultDto } from '../../services/igdbApi';
import DateField from '../shared/DateField';
import SmartImage from '../shared/SmartImage';
import BacklogSubmissionIgdbPicker from './BacklogSubmissionIgdbPicker';
import { unifiedSearchCoverUid } from './recommendationImageUtils';

const COMMENT_MAX_LENGTH = 1000;
/** Match IGDB panel height so cover fills without letterboxing. */
const PREVIEW_HEIGHT = 160;
const PREVIEW_WIDTH = Math.round((PREVIEW_HEIGHT * 2) / 3) + 8;
const NAME_DATE_WIDTH = 280;
const today = () => new Date().toISOString().slice(0, 10);

export interface BacklogSubmissionCreateFormState {
  name: string;
  gameUid: string | null;
  linkedCoverImageUid: string | null;
  igdbPreviewCoverUrl: string | null;
  originalRecommendationBy: string;
  comment: string;
  gameRecommendationUid: string | null;
  nameBase: string;
  releaseDate: string;
  externalIgdbId: string | null;
}

export function createFormFromUnified(
  result: UnifiedGameSearchResultDto
): BacklogSubmissionCreateFormState {
  return {
    name: result.name,
    gameUid: result.gameUid,
    linkedCoverImageUid: result.gameUid ? unifiedSearchCoverUid(result) : null,
    igdbPreviewCoverUrl: result.gameRecommendation?.externalIgdbIdImageURL ?? null,
    originalRecommendationBy: result.originalRecommendationBy ?? '',
    comment: '',
    gameRecommendationUid: result.gameRecommendation?.uid ?? null,
    nameBase: result.gameRecommendation?.nameBase ?? result.name,
    releaseDate:
      result.gameRecommendation?.releaseDate ?? result.releaseDate ?? today(),
    externalIgdbId: result.gameRecommendation?.externalIgdbId ?? null,
  };
}

export function emptyCreateForm(name = ''): BacklogSubmissionCreateFormState {
  return {
    name,
    gameUid: null,
    linkedCoverImageUid: null,
    igdbPreviewCoverUrl: null,
    originalRecommendationBy: '',
    comment: '',
    gameRecommendationUid: null,
    nameBase: name,
    releaseDate: today(),
    externalIgdbId: null,
  };
}

interface Props {
  open: boolean;
  initialFromSearch?: UnifiedGameSearchResultDto | null;
  /** Prefill name when opening without a unified search result (e.g. page search text). */
  initialName?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function BacklogSubmissionCreateModal({
  open,
  initialFromSearch,
  initialName = null,
  onClose,
  onSaved,
}: Props) {
  const isManagement = getAppConfig().mode === 'MANAGEMENT';
  const [form, setForm] = useState<BacklogSubmissionCreateFormState>(emptyCreateForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** Name typed before the current IGDB selection chain (survives re-picks until Clear). */
  const nameBeforeIgdbSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    nameBeforeIgdbSelectionRef.current = null;
    setForm(
      initialFromSearch
        ? createFormFromUnified(initialFromSearch)
        : emptyCreateForm(initialName?.trim() ?? '')
    );
  }, [open, initialFromSearch, initialName]);

  const hasLinkedGame = form.gameUid != null;
  const hasIgdbSelection = form.externalIgdbId != null;
  const nameLocked = hasLinkedGame || hasIgdbSelection;
  const showLinkedCover = hasLinkedGame;
  const showIgdbPreview = !hasLinkedGame && Boolean(form.igdbPreviewCoverUrl);

  const handleIgdbSelect = (result: IgdbGameSearchResultDto) => {
    setForm((f) => {
      if (f.externalIgdbId == null) {
        nameBeforeIgdbSelectionRef.current = f.name;
      }
      return {
        ...f,
        externalIgdbId: String(result.externalId),
        nameBase: result.name,
        name: result.name,
        releaseDate: result.releaseDate ?? f.releaseDate,
        igdbPreviewCoverUrl: result.coverImageUrl,
        gameRecommendationUid: null,
      };
    });
  };

  const handleIgdbClear = () => {
    const restoredName = nameBeforeIgdbSelectionRef.current;
    nameBeforeIgdbSelectionRef.current = null;
    setForm((f) => ({
      ...f,
      name: restoredName ?? f.name,
      externalIgdbId: null,
      igdbPreviewCoverUrl: null,
    }));
  };

  const coverPreview = showLinkedCover ? (
    <SmartImage
      imageUid={form.linkedCoverImageUid}
      thumbnail
      alt=""
      fit="cover"
      placeholderLabel={form.name}
      sx={{
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        flexShrink: 0,
        aspectRatio: 'unset',
        borderRadius: 0.5,
        display: { xs: 'none', sm: 'block' },
      }}
      imgSx={{ borderRadius: 0.5 }}
    />
  ) : showIgdbPreview ? (
    <Box
      component="img"
      src={form.igdbPreviewCoverUrl!}
      alt=""
      sx={{
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        objectFit: 'cover',
        objectPosition: 'center',
        flexShrink: 0,
        borderRadius: 0.5,
        display: { xs: 'none', sm: 'block' },
      }}
    />
  ) : (
    <Box
      aria-hidden
      sx={{
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
      }}
    />
  );

  const nameDateFields = (
    <Stack
      spacing={1.5}
      sx={{
        width: { xs: '100%', sm: NAME_DATE_WIDTH },
        flex: { xs: '1 1 auto', sm: '0 0 auto' },
        minWidth: 0,
      }}
    >
      <TextField
        label="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
        fullWidth
        size="small"
        disabled={nameLocked}
      />

      <DateField
        label="Release date"
        value={form.releaseDate}
        onChange={(releaseDate) => setForm((f) => ({ ...f, releaseDate }))}
        required={!form.gameRecommendationUid}
      />
    </Stack>
  );

  const igdbPanel = !hasLinkedGame ? (
    <Box
      sx={{
        width: { xs: '100%', sm: '35%' },
        flexShrink: 0,
        minWidth: { sm: 160 },
      }}
    >
      <BacklogSubmissionIgdbPicker
        query={form.name}
        externalIgdbId={form.externalIgdbId}
        searchPaused={hasIgdbSelection}
        disabled={false}
        onSelect={handleIgdbSelect}
        onClear={handleIgdbClear}
      />
    </Box>
  ) : null;

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.originalRecommendationBy.trim()) {
      setError('Please enter a nickname for who submitted this.');
      return;
    }
    if (!form.gameRecommendationUid && !form.releaseDate) {
      setError('Release date is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createBacklogRecommendation({
        gameRecommendation: {
          uid: form.gameRecommendationUid,
          nameBase: form.gameRecommendationUid ? null : form.nameBase.trim() || form.name.trim(),
          releaseDate: form.releaseDate || null,
          externalIgdbId: form.externalIgdbId,
          externalIgdbIdImageURL: form.igdbPreviewCoverUrl,
        },
        backlogRecommendation: {
          gameUid: form.gameUid,
          name: form.name.trim(),
          originalRecommendationBy: form.originalRecommendationBy.trim(),
          comment: form.comment.trim() || null,
        },
      });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save backlog submission.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        Add backlog submission
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {hasLinkedGame ? (
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
              {coverPreview}
              {nameDateFields}
            </Stack>
          ) : (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              sx={{ width: '100%' }}
            >
              {nameDateFields}
              <Box sx={{ flex: 1, minWidth: 8, display: { xs: 'none', sm: 'block' } }} />
              {coverPreview}
              {igdbPanel}
            </Stack>
          )}

          <TextField
            label="please enter a nickname, who submitted this"
            value={form.originalRecommendationBy}
            onChange={(e) =>
              setForm((f) => ({ ...f, originalRecommendationBy: e.target.value }))
            }
            required
            fullWidth
            size="small"
          />

          <TextField
            value={form.comment}
            onChange={(e) => {
              const next = e.target.value.slice(0, COMMENT_MAX_LENGTH);
              setForm((f) => ({ ...f, comment: next }));
            }}
            placeholder="leave a comment why you submit this game"
            fullWidth
            size="small"
            multiline
            minRows={3}
            inputProps={{ maxLength: COMMENT_MAX_LENGTH }}
            helperText={`${form.comment.length}/${COMMENT_MAX_LENGTH}`}
          />

          {isManagement && form.gameUid ? (
            <Typography variant="caption" color="text.secondary">
              Linked game UID: {form.gameUid}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
