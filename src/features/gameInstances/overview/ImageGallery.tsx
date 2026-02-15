import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import { ImageApi, getImageUrl, type ImageMetadataDto } from '../../../services/imageApi';

interface Props {
  /** When set, lists all images for this game. */
  gameUid: string | null;
}

function formatMetaValue(v: string | null | undefined): string {
  return v != null && v !== '' ? String(v) : '—';
}

export default function ImageGallery({ gameUid }: Props) {
  const [images, setImages] = useState<ImageMetadataDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);

  useEffect(() => {
    if (!gameUid) {
      setImages([]);
      return;
    }
    setLoading(true);
    ImageApi.listByGame(gameUid)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [gameUid]);

  if (!gameUid) return null;

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Image gallery
      </Typography>
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      ) : images.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No images for this game.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            minHeight: 280,
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
                  <CardMedia
                    component="img"
                    height="280"
                    image={thumbUrl ?? undefined}
                    alt=""
                    sx={{
                      width: 180,
                      objectFit: 'cover',
                      bgcolor: 'action.hover',
                    }}
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
    </Box>
  );
}
