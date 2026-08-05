import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  IconButton,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  AdditionalImageApi,
  type AdditionalImageMetadataDto,
} from '../../services/additionalImageApi';
import SmartImage from '../shared/SmartImage';
import AddAdditionalImageDialog from './AddAdditionalImageDialog';
import EditAdditionalImageModal from './EditAdditionalImageModal';

const PAGE_SIZE = 30;

function formatMetaValue(v: string | null | undefined): string {
  return v != null && v !== '' ? String(v) : '—';
}

export default function AdditionalImagesPage() {
  const [images, setImages] = useState<AdditionalImageMetadataDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<AdditionalImageMetadataDto | null>(null);

  const loadPage = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AdditionalImageApi.list(pageIndex, PAGE_SIZE);
      setImages(result.content ?? []);
      setPage(result.page ?? pageIndex);
      setTotalPages(result.totalPages ?? 0);
      setTotalElements(result.totalElements ?? 0);
      setExpandedUid(null);
    } catch {
      setError('Failed to load additional images.');
      setImages([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  const buttonSx = {
    bgcolor: 'grey.900',
    color: 'common.white',
    '&:hover': { bgcolor: 'grey.700' },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Additional images</Typography>
        <IconButton
          size="small"
          onClick={() => setAddDialogOpen(true)}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
          aria-label="Add additional image"
        >
          <AddIcon fontSize="small" />
        </IconButton>
        <Button
          component={Link}
          to="/reviews/yearly"
          size="small"
          startIcon={<ArrowBackIcon />}
        >
          Back to yearly review
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        Standalone images for yearly-review stand-ins (no game link).{' '}
        {totalElements > 0 ? `${totalElements} total.` : null}
      </Typography>

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
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          No additional images yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {images.map((im) => {
            const expanded = expandedUid === im.uid;

            return (
              <Card
                key={im.uid}
                variant="outlined"
                sx={{
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
                    kind="additional"
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
                    <IconButton
                      size="small"
                      sx={buttonSx}
                      onClick={() => setEditingImage(im)}
                      aria-label="Edit image"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
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
                      Aspect: {formatMetaValue(im.aspectHint)}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Source: {formatMetaValue(im.source)}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Created:{' '}
                      {im.creationDate ? new Date(im.creationDate).toLocaleString() : '—'}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="button"
                      type="button"
                      onClick={() => setEditingImage(im)}
                      sx={{
                        mt: 0.5,
                        p: 0,
                        border: 0,
                        background: 'none',
                        color: 'primary.main',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        font: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      Edit image
                    </Typography>
                  </CardContent>
                </Collapse>
              </Card>
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
          />
        </Stack>
      ) : null}

      <AddAdditionalImageDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onUploaded={() => {
          void loadPage(0);
        }}
      />

      <EditAdditionalImageModal
        open={editingImage != null}
        image={editingImage}
        onClose={() => setEditingImage(null)}
        onSaved={(updated) => {
          setImages((prev) => prev.map((im) => (im.uid === updated.uid ? updated : im)));
        }}
        onDeleted={(uid) => {
          setImages((prev) => prev.filter((im) => im.uid !== uid));
          setTotalElements((n) => Math.max(0, n - 1));
          setExpandedUid((prev) => (prev === uid ? null : prev));
          void loadPage(page);
        }}
      />
    </Box>
  );
}
