import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  AdditionalImageApi,
  type AdditionalImageMetadataDto,
} from '../../services/additionalImageApi';
import SmartImage from '../shared/SmartImage';
import AddAdditionalImageDialog from './AddAdditionalImageDialog';

const PAGE_SIZE = 10;

interface Props {
  open: boolean;
  /** Currently selected additional image uid (if any). */
  selectedUid: string | null;
  onClose: () => void;
  onSelect: (uid: string) => void;
}

export default function AdditionalImagePickerModal({
  open,
  selectedUid,
  onClose,
  onSelect,
}: Props) {
  const [images, setImages] = useState<AdditionalImageMetadataDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUid, setPendingUid] = useState<string | null>(selectedUid);
  const [addOpen, setAddOpen] = useState(false);

  const loadPage = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AdditionalImageApi.list(pageIndex, PAGE_SIZE);
      setImages(result.content ?? []);
      setPage(result.page ?? pageIndex);
      setTotalPages(result.totalPages ?? 0);
    } catch {
      setError('Failed to load additional images.');
      setImages([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setPendingUid(selectedUid);
    setAddOpen(false);
    void loadPage(0);
  }, [open, selectedUid, loadPage]);

  const handleUploaded = async (uid: string) => {
    setPendingUid(uid);
    await loadPage(0);
    onSelect(uid);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.background.paper,
            opacity: 1,
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="span" variant="h6">
              Select additional image
            </Typography>
            <IconButton
              size="small"
              onClick={() => setAddOpen(true)}
              sx={{ border: 1, borderColor: 'divider' }}
              aria-label="Add additional image"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : images.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No additional images yet. Use + to upload one.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 1.5,
              }}
            >
              {images.map((im) => {
                const selected = pendingUid === im.uid;
                return (
                  <Box
                    key={im.uid}
                    onClick={() => setPendingUid(im.uid)}
                    sx={{
                      cursor: 'pointer',
                      border: 2,
                      borderColor: selected ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      outline: selected ? '2px solid' : 'none',
                      outlineColor: 'primary.main',
                    }}
                  >
                    <SmartImage
                      imageUid={im.uid}
                      kind="additional"
                      thumbnail
                      alt=""
                      aspectRatio={2 / 3}
                      fit="contain"
                      sx={{ width: '100%', height: 140 }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
          {totalPages > 1 ? (
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => void loadPage(value - 1)}
                color="primary"
                disabled={loading}
                size="small"
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!pendingUid}
            onClick={() => {
              if (!pendingUid) return;
              onSelect(pendingUid);
              onClose();
            }}
          >
            Use selected
          </Button>
        </DialogActions>
      </Dialog>

      <AddAdditionalImageDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onUploaded={(uid) => void handleUploaded(uid)}
      />
    </>
  );
}
