import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import {
  AdditionalImageApi,
  type AdditionalImageAspectHint,
  type AdditionalImageSource,
  type AdditionalImageType,
} from '../../services/additionalImageApi';

const IMAGE_TYPES: AdditionalImageType[] = ['COVER', 'SCREENSHOT', 'ARTWORK', 'OTHER'];
const ASPECT_HINTS: AdditionalImageAspectHint[] = ['VERTICAL', 'HORIZONTAL', 'SQUARE', 'FREE'];
const SOURCES: AdditionalImageSource[] = ['MANUAL', 'AI', 'IMPORT'];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the new image uid after a successful upload. */
  onUploaded: (uid: string) => void;
}

export default function AddAdditionalImageDialog({ open, onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<AdditionalImageType>('ARTWORK');
  const [aspectHint, setAspectHint] = useState<AdditionalImageAspectHint>('VERTICAL');
  const [source, setSource] = useState<AdditionalImageSource>('MANUAL');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setType('ARTWORK');
    setAspectHint('VERTICAL');
    setSource('MANUAL');
    setError(null);
  }, [open]);

  const handleSubmit = async () => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('aspectHint', aspectHint);
      formData.append('source', source);
      const result = await AdditionalImageApi.upload(formData);
      if (!result.uid) throw new Error('Missing uid');
      onUploaded(result.uid);
      onClose();
    } catch {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !uploading && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: (theme) => theme.palette.background.paper,
          opacity: 1,
        },
      }}
    >
      <DialogTitle>Add additional image</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Button variant="outlined" component="label" fullWidth>
            {file ? file.name : 'Choose image file'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          <FormControl size="small" fullWidth required>
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
          <FormControl size="small" fullWidth required>
            <InputLabel>Aspect hint</InputLabel>
            <Select
              label="Aspect hint"
              value={aspectHint}
              onChange={(e) => setAspectHint(e.target.value as AdditionalImageAspectHint)}
            >
              {ASPECT_HINTS.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth required>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
