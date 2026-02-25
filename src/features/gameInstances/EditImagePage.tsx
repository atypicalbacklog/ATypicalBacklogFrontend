import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { ImageApi, getImageUrl, type ImageMetadataDto, type UpdateImageMetadataRequest } from '../../services/imageApi';
import SmartImage from '../shared/SmartImage';

const OWNER_TYPES: Array<'GAME' | 'GAME_INSTANCE' | 'DLC'> = ['GAME', 'GAME_INSTANCE', 'DLC'];
const IMAGE_TYPES: Array<'COVER' | 'SCREENSHOT' | 'ARTWORK' | 'OTHER'> = ['COVER', 'SCREENSHOT', 'ARTWORK', 'OTHER'];
const ASPECT_HINTS: Array<'VERTICAL' | 'HORIZONTAL' | 'SQUARE' | 'FREE'> = ['VERTICAL', 'HORIZONTAL', 'SQUARE', 'FREE'];

export default function EditImagePage() {
  const { instanceUid, imageUid } = useParams<{ instanceUid: string; imageUid: string }>();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState<ImageMetadataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [ownerType, setOwnerType] = useState<ImageMetadataDto['ownerType']>('GAME_INSTANCE');
  const [gameUid, setGameUid] = useState('');
  const [gameInstanceUid, setGameInstanceUid] = useState('');
  const [dlcUid, setDlcUid] = useState('');
  const [type, setType] = useState<ImageMetadataDto['type']>('COVER');
  const [aspectHint, setAspectHint] = useState<ImageMetadataDto['aspectHint']>('VERTICAL');
  const [primaryImage, setPrimaryImage] = useState(false);

  useEffect(() => {
    if (!instanceUid || !imageUid) {
      setLoading(false);
      setMetadata(null);
      return;
    }
    setLoading(true);
    setError(null);

    const applyFound = (found: ImageMetadataDto | undefined) => {
      setMetadata(found ?? null);
      if (found) {
        setOwnerType(found.ownerType);
        setGameUid(found.gameUid ?? '');
        setGameInstanceUid(found.gameInstanceUid ?? '');
        setDlcUid(found.dlcUid ?? '');
        setType(found.type);
        setAspectHint(found.aspectHint);
        setPrimaryImage(found.primaryImage);
      } else if (instanceUid) {
        setGameInstanceUid(instanceUid);
      }
    };

    Promise.resolve()
      .then(() => ImageApi.listByGameInstance(instanceUid))
      .then((list) => {
        const found = list.find((im) => im.uid === imageUid);
        if (found) return found;
        return GameInstanceApi.get(instanceUid).then((instance) => {
          if (!instance.gameUid) return undefined;
          return ImageApi.listByGame(instance.gameUid).then(
            (gameList) => gameList.find((im) => im.uid === imageUid)
          );
        });
      })
      .then((found) => applyFound(found))
      .catch(() => {
        setError('Failed to load image metadata.');
        setMetadata(null);
      })
      .finally(() => setLoading(false));
  }, [instanceUid, imageUid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUid) return;
    setSaving(true);
    setError(null);
    try {
      const data: UpdateImageMetadataRequest = {
        ownerType,
        gameUid: gameUid.trim() || null,
        gameInstanceUid: gameInstanceUid.trim() || null,
        dlcUid: dlcUid.trim() || null,
        type,
        aspectHint,
        primaryImage,
      };
      await ImageApi.updateMetadata(imageUid, data);
      setMetadata((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              gameUid: data.gameUid ?? null,
              gameInstanceUid: data.gameInstanceUid ?? null,
              dlcUid: data.dlcUid ?? null,
            }
          : null
      );
    } catch {
      setError('Failed to update image metadata.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageUid) return;
    setDeleting(true);
    try {
      await ImageApi.delete(imageUid);
      setDeleteConfirmOpen(false);
      navigate(instanceUid ? `/game-instances/${instanceUid}/edit` : '/');
    } catch {
      setError('Failed to delete image.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (!instanceUid || !imageUid)
    return (
      <Box>
        <Typography color="error">Missing instance or image.</Typography>
        <Button component={Link} to="/library">Back to Library</Button>
      </Box>
    );
  if (error && !metadata)
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button component={Link} to={instanceUid ? `/game-instances/${instanceUid}/edit` : '/'}>
          Back
        </Button>
      </Box>
    );

  const previewImageUrl = getImageUrl(imageUid, true);

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button component={Link} to="/library" size="small">
          Back to Library
        </Button>
        <Typography variant="body2" color="text.secondary">
          Edit image · Instance: {instanceUid}
        </Typography>
        <Button
          component={Link}
          to={`/game-instances/${instanceUid}/edit`}
          size="small"
        >
          Back to instance
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Image preview */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: (theme) => theme.palette.background.paper,
          opacity: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Image
        </Typography>
        {previewImageUrl ? (
          <SmartImage
            imageUid={imageUid ?? null}
            thumbnail
            alt=""
            aspectRatio={1}
            fit="contain"
            sx={{
              width: 200,
              height: 200,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
            imgSx={{ borderRadius: 1 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Image UID: {imageUid}
          </Typography>
        )}
        {metadata && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Source: {metadata.source} · Created: {metadata.creationDate ? new Date(metadata.creationDate).toLocaleString() : '—'}
          </Typography>
        )}
      </Paper>

      {/* Image metadata form */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: (theme) => theme.palette.background.paper,
          opacity: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Image metadata
        </Typography>
        {!metadata && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Metadata could not be loaded. You can still update or delete.
          </Typography>
        )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Owner type</InputLabel>
              <Select
                label="Owner type"
                value={ownerType}
                onChange={(e) => setOwnerType(e.target.value as ImageMetadataDto['ownerType'])}
              >
                {OWNER_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Game UID"
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Game instance UID"
              value={gameInstanceUid}
              onChange={(e) => setGameInstanceUid(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="DLC UID"
              value={dlcUid}
              onChange={(e) => setDlcUid(e.target.value)}
              size="small"
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value as ImageMetadataDto['type'])}
              >
                {IMAGE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Aspect hint</InputLabel>
              <Select
                label="Aspect hint"
                value={aspectHint}
                onChange={(e) => setAspectHint(e.target.value as ImageMetadataDto['aspectHint'])}
              >
                {ASPECT_HINTS.map((a) => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={primaryImage}
                  onChange={(e) => setPrimaryImage(e.target.checked)}
                />
              }
              label="Primary image"
            />
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : 'Update metadata'}
            </Button>
          </Box>
      </Paper>

      {/* Delete image */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: (theme) => theme.palette.background.paper,
          opacity: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Delete this image
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Removes the image record and associated files. This cannot be undone.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteConfirmOpen(true)}
        >
          Delete image
        </Button>
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.background.paper,
            opacity: 1,
          },
        }}
      >
        <DialogTitle>Delete image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove the image and its files. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
