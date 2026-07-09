import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import CompletionBar from '../shared/CompletionBar';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
import { GameOverviewRowDto } from './types';
import { createGameInstanceReturnState, gameInstanceTo } from '../gameInstances/gameInstanceNavigation';

export const LIBRARY_CARD_WIDTH = 200;
const CARD_HEIGHT = 325;
const COVER_HEIGHT = 260;

type Props = { item: GameOverviewRowDto };

export default function LibraryListItem({ item }: Props) {
  const location = useLocation();
  const instanceReturn = createGameInstanceReturnState(location);
  const { referenceData } = useReferenceData();
  const completionStateName =
    referenceData?.data.completionStates.find(
      (c) => c.uid === item.completionStateUid
    )?.name ?? null;

  const isDlc = item.isDlc === true;
  const coverUid = isDlc
    ? (item.dlcCoverImageUid ?? item.instanceCoverImageUid ?? item.gameCoverImageUid ?? item.coverImageUid)
    : (item.instanceCoverImageUid ?? item.gameCoverImageUid ?? item.coverImageUid);

  const coverTooltip = item.dlcName ?? item.instanceName ?? item.gameName;

  const platforms = referenceData?.data.platforms ?? [];
  const consoles = referenceData?.data.consoles ?? [];
  const platform = item.platformUid
    ? platforms.find((p) => p.uid === item.platformUid) ?? null
    : null;
  const platformConsoleName =
    platform != null
      ? consoles.find((c) => c.uid === platform.consoleUid)?.name ?? ''
      : '';

  const releaseDate =
    item.dlcReleaseDate ?? item.instanceReleaseDate ?? item.gameReleaseDate ?? null;

  const to = item.gameInstanceUid
    ? gameInstanceTo(item.gameInstanceUid, instanceReturn)
    : `/games/${item.gameUid}`;

  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        width: { xs: 170, sm: LIBRARY_CARD_WIDTH },
        height: { xs: 290, sm: CARD_HEIGHT },
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        boxShadow: 1,
        border: 1,
        borderColor: 'divider',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        transition: (theme) =>
          theme.transitions.create('border-color', {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Tooltip
        title={coverTooltip}
        enterDelay={300}
        placement="top"
        slotProps={{
          tooltip: { sx: { fontSize: '0.9375rem' } },
          popper: {
            modifiers: [
              { name: 'offset', options: { offset: [0, -(COVER_HEIGHT / 2) - 40] } },
            ],
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 220, sm: COVER_HEIGHT },
            flexShrink: 0,
          }}
        >
          <SmartImage
            imageUid={coverUid}
            thumbnail
            alt=""
            aspectRatio={2 / 3}
            fit="contain"
            sx={{
              width: '100%',
              height: '100%',
              aspectRatio: 'unset',
              borderRadius: 0,
            }}
            imgSx={{ borderRadius: 0 }}
          />
          {isDlc && (
          <Chip
            label="DLC"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              height: 26,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: 'grey.800',
              color: 'grey.100',
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        )}
        </Box>
      </Tooltip>

      <Stack spacing={0.75} sx={{ p: 1, flex: 1, minHeight: 0 }}>
        {(platformConsoleName || releaseDate) ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              minWidth: 0,
            }}
          >
            {platformConsoleName ? (
              <Typography variant="body2" color="text.secondary" noWrap title={platformConsoleName}>
                {platformConsoleName}
              </Typography>
            ) : <span />}
            {releaseDate != null && (
              <DateWithIcon date={releaseDate} tooltip="Release Date" variant="body2" sx={{ flexShrink: 0 }} />
            )}
          </Box>
        ) : null}
        {completionStateName ? (
          <CompletionBar
            completionState={completionStateName}
            playthroughState={item.hasActivePlaythrough ? 'Active' : null}
            size="small"
          />
        ) : null}
      </Stack>
    </Box>
  );
}
