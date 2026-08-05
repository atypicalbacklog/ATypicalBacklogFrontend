import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  AdditionalImageApi,
  type AdditionalImageAspectHint,
  type AdditionalImageMetadataDto,
  type AdditionalImageSource,
  type AdditionalImageType,
  type UpdateAdditionalImageMetadataRequest,
} from '../../services/additionalImageApi';
import SmartImage from '../shared/SmartImage';

const IMAGE_TYPES: AdditionalImageType[] = ['COVER', 'SCREENSHOT', 'ARTWORK', 'OTHER'];
const ASPECT_HINTS: AdditionalImageAspectHint[] = ['VERTICAL', 'HORIZONTAL', 'SQUARE', 'FREE'];
const SOURCES: AdditionalImageSource[] = ['MANUAL', 'AI', 'IMPORT'];

interface Props {
  open: boolean;
  image: AdditionalImageMetadataDto | null;
  onClose: () => void;
  onSaved: (updated: AdditionalImageMetadataDto) => void;
  onDeleted: (uid: string) => void;
}

export default function EditAdditionalImageModal({
  open,
  image,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [type, setType] = useState<AdditionalImageType>('ARTWORK');
  const [aspectHint, setAspectHint] = useState<AdditionalImageAspectHint>('VERTICAL');
  const [source, setSource] = useState<AdditionalImageSource>('MANUAL');

  useEffect(() => {
    if (!open || !image) return;
    setType(image.type);
    setAspectHint(image.aspectHint);
    setSource(image.source);
    setError(null);
    setDeleteConfirmOpen(false);
  }, [open, image]);

  const busy = saving || deleting;

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setSaving(true);
    setError(null);
    try {
      const data: UpdateAdditionalImageMetadataRequest = {
        type,
        aspectHint,
        source,
      };
      await AdditionalImageApi.updateMetadata(image.uid, data);
      onSaved({ ...image, ...data });
      onClose();
    } catch {
      setError('Failed to update image metadata.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!image) return;
    setDeleting(true);
    try {
      await AdditionalImageApi.delete(image.uid);
      setDeleteConfirmOpen(false);
      onDeleted(image.uid);
      onClose();
    } catch {
      setError('Failed to delete image.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open && image != null}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.background.paper,
            opacity: 1,
          },
        }}
      >
        <DialogTitle>Edit additional image</DialogTitle>
        <DialogContent>
          {image ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems="flex-start"
              sx={{ mt: 1 }}
            >
              <SmartImage
                imageUid={image.uid}
                kind="additional"
                thumbnail={false}
                alt=""
                aspectRatio={2 / 3}
                fit="contain"
                sx={{ width: 220, flexShrink: 0 }}
              />

              <Box
                component="form"
                id="edit-additional-image-form"
                onSubmit={(e) => void handleSubmit(e)}
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Stack spacing={2}>
                  {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    UID: {image.uid}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    File: {image.filename} ({image.mimetype})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(image.creationDate).toLocaleString()}
                  </Typography>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={type}
                      onChange={(e) => setType(e.target.value as AdditionalImageType)}
                    >
                      {IMAGE_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Aspect hint</InputLabel>
                    <Select
                      label="Aspect hint"
                      value={aspectHint}
                      onChange={(e) =>
                        setAspectHint(e.target.value as AdditionalImageAspectHint)
                      }
                    >
                      {ASPECT_HINTS.map((a) => (
                        <MenuItem key={a} value={a}>
                          {a}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Source</InputLabel>
                    <Select
                      label="Source"
                      value={source}
                      onChange={(e) => setSource(e.target.value as AdditionalImageSource)}
                    >
                      {SOURCES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={busy || !image}
          >
            Delete
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-additional-image-form"
              variant="contained"
              disabled={busy || !image}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete additional image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes the image and its thumbnail files.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteImage()}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
