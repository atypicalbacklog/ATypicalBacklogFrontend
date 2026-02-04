import { Box, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TimeTrackingOverlay from './TimeTrackingOverlay';
import PlaythroughTimeDisplay from './PlaythroughTimeDisplay';
import type { ActivePlaythroughOverviewRow } from '../../types/dto';

const THUMBNAIL_BASE = '/api/thumbnails';

interface Props {
  row: ActivePlaythroughOverviewRow;
  playthroughTypeName: string;
  onStart: (playthroughUid: string) => void;
  onStop: (playthroughUid: string) => void;
  isActionDisabled: boolean;
}

const headerBorder = { border: 1, borderColor: 'divider', borderRadius: 1 };

export default function PlaythroughCard({
  row,
  playthroughTypeName,
  onStart,
  onStop,
  isActionDisabled,
}: Props) {
  const handleOverlayClick = () => {
    if (isActionDisabled) return;
    if (row.isTimeTrackingActive) {
      onStop(row.playthroughUid);
    } else {
      onStart(row.playthroughUid);
    }
  };

  const thumbnailUrl = row.thumbnailImageUid
    ? `${THUMBNAIL_BASE}/${row.thumbnailImageUid}`
    : null;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        maxWidth: 280,
      }}
    >
      {/* Top: Game name (centered, bordered) */}
      <Box sx={{ p: 1.5, textAlign: 'center', ...headerBorder, mx: 1, mt: 1 }}>
        <Typography variant="h6" fontWeight={600} noWrap title={row.displayName}>
          {row.displayName}
        </Typography>
      </Box>
      {/* Playthrough type (centered, bordered) */}
      <Box sx={{ p: 1, textAlign: 'center', ...headerBorder, mx: 1, mt: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {playthroughTypeName}
        </Typography>
      </Box>

      {/* Middle: Thumbnail + overlay (vertical aspect) */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '3/4',
          bgcolor: 'grey.300',
          flexShrink: 0,
        }}
      >
        {thumbnailUrl ? (
          <Box
            component="img"
            src={thumbnailUrl}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        <TimeTrackingOverlay
          isTimeTrackingActive={row.isTimeTrackingActive}
          onClick={handleOverlayClick}
          disabled={isActionDisabled}
        />
      </Box>

      {/* Bottom: Gear → Edit, Time (hh:mm:ss) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 1.5, pt: 1 }}
      >
        <Link
          component={RouterLink}
          to={`/playthroughs/${row.playthroughUid}`}
          sx={{
            color: 'text.secondary',
            fontSize: 24,
            lineHeight: 1,
            '&:hover': { color: 'primary.main' },
          }}
          aria-label="Edit playthrough"
        >
          ⚙
        </Link>
        <PlaythroughTimeDisplay
          totalPlaytimeSeconds={row.totalPlaytimeSeconds}
          isTimeTrackingActive={row.isTimeTrackingActive}
          currentSessionStartedAt={row.currentSessionStartedAt}
        />
      </Stack>
    </Box>
  );
}
