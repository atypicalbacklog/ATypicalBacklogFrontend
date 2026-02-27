import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Collapse,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import { initialFetchBegin, initialFetchEnd } from '../../../app/initialFetchGuard';
import { ImageApi, getImageUrl, type ImageMetadataDto } from '../../../services/imageApi';
import SmartImage from '../../shared/SmartImage';

const OWNER_TYPES: Array<'GAME' | 'GAME_INSTANCE' | 'DLC'> = ['GAME', 'GAME_INSTANCE', 'DLC'];
const IMAGE_TYPES: Array<'COVER' | 'SCREENSHOT' | 'ARTWORK' | 'OTHER'> = ['COVER', 'SCREENSHOT', 'ARTWORK', 'OTHER'];
const ASPECT_HINTS: Array<'VERTICAL' | 'HORIZONTAL' | 'SQUARE' | 'FREE'> = ['VERTICAL', 'HORIZONTAL', 'SQUARE', 'FREE'];
const SOURCES: Array<'MANUAL' | 'AI' | 'IMPORT'> = ['MANUAL', 'AI', 'IMPORT'];

interface Props {
  /** When set, lists all images for this game. */
  gameUid: string | null;
  /** Optional: when on a game instance page, pass for pre-fill in add-image form. */
  gameInstanceUid?: string | null;
}

function formatMetaValue(v: string | null | undefined): string {
  return v != null && v !== '' ? String(v) : '—';
}

export default function ImageGallery({ gameUid, gameInstanceUid: gameInstanceUidProp }: Props) {
  const [images, setImages] = useState<ImageMetadataDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [ownerType, setOwnerType] = useState<ImageMetadataDto['ownerType']>(
    gameInstanceUidProp ? 'GAME_INSTANCE' : 'GAME'
  );
  const [formGameUid, setFormGameUid] = useState(gameUid ?? '');
  const [formGameInstanceUid, setFormGameInstanceUid] = useState(gameInstanceUidProp ?? '');
  const [formDlcUid, setFormDlcUid] = useState('');
  const [type, setType] = useState<ImageMetadataDto['type']>('COVER');
  const [aspectHint, setAspectHint] = useState<ImageMetadataDto['aspectHint']>('VERTICAL');
  const [source, setSource] = useState<ImageMetadataDto['source']>('MANUAL');
  const [primaryImage, setPrimaryImage] = useState(false);

  const loadImages = useCallback(() => {
    if (!gameUid) return;
    setLoading(true);
    return ImageApi.listByGame(gameUid)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [gameUid]);

  useEffect(() => {
    if (!gameUid) {
      setImages([]);
      return;
    }
    const key = `image-gallery-${gameUid}`;
    if (!initialFetchBegin(key)) return;
    loadImages()?.finally(() => initialFetchEnd(key));
  }, [gameUid, loadImages]);

  useEffect(() => {
    if (addDialogOpen && gameUid) {
      setFormGameUid(gameUid);
      setFormGameInstanceUid(gameInstanceUidProp ?? '');
      setFormDlcUid('');
      setOwnerType(gameInstanceUidProp ? 'GAME_INSTANCE' : 'GAME');
      setFile(null);
      setType('COVER');
      setAspectHint('VERTICAL');
      setSource('MANUAL');
      setPrimaryImage(false);
      setAddError(null);
    }
  }, [addDialogOpen, gameUid, gameInstanceUidProp]);

  const handleAddSubmit = async () => {
    if (!file || !gameUid) return;
    setAddError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerType', ownerType);
      formData.append('type', type);
      formData.append('aspectHint', aspectHint);
      formData.append('source', source);
      if (formGameUid.trim()) formData.append('gameUid', formGameUid.trim());
      if (formGameInstanceUid.trim()) formData.append('gameInstanceUid', formGameInstanceUid.trim());
      if (formDlcUid.trim()) formData.append('dlcUid', formDlcUid.trim());
      formData.append('primaryImage', String(primaryImage));
      await ImageApi.upload(formData);
      setAddDialogOpen(false);
      loadImages();
    } catch {
      setAddError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  if (!gameUid) return null;

  return (
    <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Image gallery
        </Typography>
        <IconButton
          size="small"
          onClick={() => setAddDialogOpen(true)}
          sx={{ border: 1, borderColor: 'divider' }}
          aria-label="Add picture"
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      ) : images.length === 0 ? (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          No images for this game.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: 2,
            pb: 1,
            minHeight: 280,
            width: '100%',
            minWidth: 0,
            overflowX: { xs: 'hidden', sm: 'auto' },
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {images.map((im) => {
            const expanded = expandedUid === im.uid;
            const thumbUrl = getImageUrl(im.uid, true);
            const editLink =
              im.gameInstanceUid != null
                ? `/game-instances/${im.gameInstanceUid}/images/${im.uid}/edit`
                : null;

            const buttonSx = {
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.700' },
            };

            return (
              <Card
                key={im.uid}
                variant="outlined"
                sx={{
                  flexShrink: 0,
                  width: expanded ? 300 : 180,
                  minWidth: 180,
                  minHeight: 280,
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <Box sx={{ position: 'relative', flexShrink: 0, width: 180, minWidth: 180 }}>
                  <SmartImage
                    imageUid={im.uid}
                    thumbnail
                    alt=""
                    aspectRatio={2 / 3}
                    fit="contain"
                    sx={{ width: 180, height: 280 }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    {editLink && (
                      <IconButton
                        component={Link}
                        to={editLink}
                        size="small"
                        sx={buttonSx}
                        aria-label="Edit image"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      sx={{
                        ...buttonSx,
                        '& .MuiSvgIcon-root': { transform: 'rotate(-90deg)' },
                      }}
                      onClick={() =>
                        setExpandedUid((prev) => (prev === im.uid ? null : im.uid))
                      }
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Collapse metadata' : 'Expand metadata'}
                    >
                      {expanded ? (
                        <ExpandLess fontSize="small" />
                      ) : (
                        <ExpandMore fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>
                <Collapse in={expanded} orientation="horizontal">
                  <CardContent sx={{ py: 1.5, px: 1.5, maxWidth: 120, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Type: {formatMetaValue(im.type)}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Owner: {formatMetaValue(im.ownerType)}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Created: {im.creationDate ? new Date(im.creationDate).toLocaleString() : '—'}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Primary: {im.primaryImage ? 'Yes' : 'No'}
                    </Typography>
                    {editLink && (
                      <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                        <Link to={editLink}>Edit image</Link>
                      </Typography>
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog
        open={addDialogOpen}
        onClose={() => !uploading && setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.background.paper,
            opacity: 1,
          },
        }}
      >
        <DialogTitle>Add picture</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {addError && (
              <Alert severity="error" onClose={() => setAddError(null)}>
                {addError}
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
              value={formGameUid}
              onChange={(e) => setFormGameUid(e.target.value)}
              size="small"
              fullWidth
              required={ownerType === 'GAME'}
              helperText={ownerType === 'GAME' ? 'Required when owner type is GAME.' : undefined}
            />
            <TextField
              label="Game instance UID"
              value={formGameInstanceUid}
              onChange={(e) => setFormGameInstanceUid(e.target.value)}
              size="small"
              fullWidth
              required={ownerType === 'GAME_INSTANCE'}
              helperText={ownerType === 'GAME_INSTANCE' ? 'Required when owner type is GAME_INSTANCE.' : undefined}
            />
            <TextField
              label="DLC UID"
              value={formDlcUid}
              onChange={(e) => setFormDlcUid(e.target.value)}
              size="small"
              fullWidth
              required={ownerType === 'DLC'}
              helperText={ownerType === 'DLC' ? 'Required when owner type is DLC.' : undefined}
            />
            <FormControl size="small" fullWidth required>
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
            <FormControl size="small" fullWidth required>
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
            <FormControl size="small" fullWidth required>
              <InputLabel>Source</InputLabel>
              <Select
                label="Source"
                value={source}
                onChange={(e) => setSource(e.target.value as ImageMetadataDto['source'])}
              >
                {SOURCES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSubmit}
            disabled={
              uploading ||
              !file ||
              (ownerType === 'GAME' && !formGameUid.trim()) ||
              (ownerType === 'GAME_INSTANCE' && !formGameInstanceUid.trim()) ||
              (ownerType === 'DLC' && !formDlcUid.trim())
            }
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
