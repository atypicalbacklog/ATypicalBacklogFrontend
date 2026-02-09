import {
  Box,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { getImageUrl } from '../../services/imageApi';
import CompletionBar from '../shared/CompletionBar';
import { GameOverviewRowDto } from './types';
import { formatPlaytime } from './formatPlaytime';

type Props = { item: GameOverviewRowDto };

export default function LibraryListItem({ item }: Props) {
  const { referenceData } = useReferenceData();
  const completionStateName =
    referenceData?.data.completionStates.find(
      (c) => c.uid === item.completionStateUid
    )?.name ?? null;

  const thumbnailUrl = getImageUrl(item.coverImageUid, true);

  return (
    <Box border={1} borderRadius={2} p={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        {thumbnailUrl ? (
          <Box
            component="img"
            src={thumbnailUrl}
            alt=""
            width={64}
            height={64}
            sx={{ objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.300' }}
          />
        ) : (
          <Box
            width={64}
            height={64}
            bgcolor="grey.300"
            sx={{ borderRadius: 1 }}
          />
        )}

        <Box flexGrow={1} minWidth={0}>
          <Typography variant="subtitle1" component="span">
            <Link
              component={RouterLink}
              to={
                item.gameInstanceUid
                  ? `/game-instances/${item.gameInstanceUid}`
                  : `/games/${item.gameUid}`
              }
              color="primary"
              underline="hover"
            >
              {item.gameName}
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {[item.platformName, item.variantName].filter(Boolean).join(' · ') ||
              '—'}
            {(item.instanceReleaseDate ?? item.gameReleaseDate) &&
              ` · ${item.instanceReleaseDate ?? item.gameReleaseDate}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {item.totalPlaytimeSeconds > 0 && (
            <Typography variant="body2" color="text.secondary">
              {formatPlaytime(item.totalPlaytimeSeconds)}
            </Typography>
          )}
          {item.inBacklog && <Chip label="Backlog" size="small" />}
          {completionStateName && (
            <CompletionBar
              completionState={completionStateName}
              playthroughState={item.hasActivePlaythrough ? 'Active' : null}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
