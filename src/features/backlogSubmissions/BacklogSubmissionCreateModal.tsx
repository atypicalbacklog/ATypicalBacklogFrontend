import { useEffect, useState } from 'react';
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
const PREVIEW_WIDTH = 72;
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
    igdbPreviewCoverUrl: null,
    originalRecommendationBy: result.originalRecommendationBy ?? '',
    comment: '',
    gameRecommendationUid: result.gameRecommendation?.uid ?? null,
    nameBase: result.gameRecommendation?.nameBase ?? result.name,
    releaseDate:
      result.gameRecommendation?.releaseDate ?? result.releaseDate ?? today(),
    externalIgdbId: result.gameRecommendation?.externalIgdbId ?? null,
  };
}

export function emptyCreateForm(): BacklogSubmissionCreateFormState {
  return {
    name: '',
    gameUid: null,
    linkedCoverImageUid: null,
    igdbPreviewCoverUrl: null,
    originalRecommendationBy: '',
    comment: '',
    gameRecommendationUid: null,
    nameBase: '',
    releaseDate: today(),
    externalIgdbId: null,
  };
}

interface Props {
  open: boolean;
  initialFromSearch?: UnifiedGameSearchResultDto | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function BacklogSubmissionCreateModal({
  open,
  initialFromSearch,
  onClose,
  onSaved,
}: Props) {
  const isManagement = getAppConfig().mode === 'MANAGEMENT';
  const [form, setForm] = useState<BacklogSubmissionCreateFormState>(emptyCreateForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      initialFromSearch
        ? createFormFromUnified(initialFromSearch)
        : emptyCreateForm()
    );
  }, [open, initialFromSearch]);

  const hasLinkedGame = form.gameUid != null;
  const showLinkedCover = hasLinkedGame;
  const showIgdbPreview = !hasLinkedGame && form.externalIgdbId != null;

  const handleIgdbConfirm = (result: IgdbGameSearchResultDto) => {
    setForm((f) => ({
      ...f,
      externalIgdbId: String(result.externalId),
      nameBase: result.name,
      name: f.name.trim() ? f.name : result.name,
      releaseDate: result.releaseDate ?? f.releaseDate,
      igdbPreviewCoverUrl: result.coverImageUrl,
      gameRecommendationUid: null,
    }));
  };

  const handleIgdbClear = () => {
    setForm((f) => ({
      ...f,
      externalIgdbId: null,
      igdbPreviewCoverUrl: null,
    }));
  };

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
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {showLinkedCover ? (
              <SmartImage
                imageUid={form.linkedCoverImageUid}
                thumbnail
                alt=""
                placeholderLabel={form.name}
                sx={{ width: PREVIEW_WIDTH, flexShrink: 0 }}
              />
            ) : showIgdbPreview ? (
              form.igdbPreviewCoverUrl ? (
                <Box
                  component="img"
                  src={form.igdbPreviewCoverUrl}
                  alt=""
                  sx={{
                    width: PREVIEW_WIDTH,
                    aspectRatio: '2/3',
                    objectFit: 'contain',
                    flexShrink: 0,
                    borderRadius: 0.5,
                    bgcolor: 'action.hover',
                  }}
                />
              ) : (
                <SmartImage
                  imageUid={null}
                  thumbnail
                  alt=""
                  placeholderLabel={form.name}
                  sx={{ width: PREVIEW_WIDTH, flexShrink: 0 }}
                />
              )
            ) : null}

            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  fullWidth
                  size="small"
                />
                <BacklogSubmissionIgdbPicker
                  gameName={form.name}
                  externalIgdbId={form.externalIgdbId}
                  disabled={hasLinkedGame}
                  onConfirm={handleIgdbConfirm}
                  onClear={handleIgdbClear}
                />
              </Stack>

              <DateField
                label="Release date"
                value={form.releaseDate}
                onChange={(releaseDate) => setForm((f) => ({ ...f, releaseDate }))}
                required={!form.gameRecommendationUid}
              />
            </Stack>
          </Stack>

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
