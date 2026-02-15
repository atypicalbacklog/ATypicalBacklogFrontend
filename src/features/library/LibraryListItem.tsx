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
import VariantConsolePlatformDisplay from '../shared/VariantConsolePlatformDisplay';
import { GameOverviewRowDto } from './types';
import { formatPlaytime } from './formatPlaytime';

type Props = { item: GameOverviewRowDto };

export default function LibraryListItem({ item }: Props) {
  const { referenceData } = useReferenceData();
  const completionStateName =
    referenceData?.data.completionStates.find(
      (c) => c.uid === item.completionStateUid
    )?.name ?? null;

  const isDlc = item.isDlc === true;
  const coverUid = isDlc
    ? (item.dlcCoverImageUid ?? item.instanceCoverImageUid ?? item.gameCoverImageUid ?? item.coverImageUid)
    : (item.instanceCoverImageUid ?? item.gameCoverImageUid ?? item.coverImageUid);
  const thumbnailUrl = getImageUrl(coverUid, true);
  const baseName = item.instanceName || item.gameName;
  const dlcPrimaryName = item.dlcName || baseName;
  const dlcSecondaryName = item.instanceName || item.gameName;
  const mainName = isDlc ? `${dlcPrimaryName} - (${dlcSecondaryName})` : baseName;
  const releaseDate = isDlc
    ? item.dlcReleaseDate ?? null
    : item.instanceReleaseDate ?? item.gameReleaseDate;

  const platforms = referenceData?.data.platforms ?? [];
  const consoles = referenceData?.data.consoles ?? [];
  const platform = item.platformUid
    ? platforms.find((p) => p.uid === item.platformUid) ?? null
    : null;
  const platformName =
    item.platformName ??
    platform?.name ??
    (item.platformUid ?? '');
  const platformConsoleName =
    platform != null
      ? consoles.find((c) => c.uid === platform.consoleUid)?.name ?? ''
      : '';
  const variantName = item.variantName ?? '';

  return (
    <Box
      border={1}
      borderRadius={2}
      p={2}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(4px)',
      }}
    >
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
              <Stack direction="row" spacing={0.5} alignItems="center" component="span">
                {isDlc && (
                  <Chip
                    label="DLC"
                    size="small"
                    color="default"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                <Box component="span">
                  {mainName}
                </Box>
              </Stack>
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            {item.platformUid ? (
              <VariantConsolePlatformDisplay
                variantName={variantName}
                platformName={platformName}
                platformConsoleName={platformConsoleName}
                originalConsoleName={null}
                variant="body2"
                color="text.secondary"
              />
            ) : (
              '—'
            )}
            {releaseDate && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {` · ${releaseDate}`}
              </Typography>
            )}
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
