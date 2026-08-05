import { Box, Chip, Tooltip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import SmartImage from '../shared/SmartImage';
import { GameOverviewRowDto } from './types';
import { createGameInstanceReturnState, gameInstanceTo } from '../gameInstances/gameInstanceNavigation';

type Props = { item: GameOverviewRowDto; tooltipOverride?: string };

export default function LibraryListItemMinimized({ item, tooltipOverride }: Props) {
  const location = useLocation();
  const instanceReturn = createGameInstanceReturnState(location);
  const isDlc = item.isDlc === true;
  const coverUid = isDlc
    ? (item.dlcCoverImageUid ?? item.instanceCoverImageUid ?? item.gameCoverImageUid ?? item.coverImageUid)
    : (item.instanceCoverImageUid ?? item.gameCoverImageUid ?? item.coverImageUid);

  const coverTooltip = tooltipOverride ?? item.dlcName ?? item.instanceName ?? item.gameName;

  const to = item.gameInstanceUid
    ? gameInstanceTo(item.gameInstanceUid, instanceReturn)
    : `/games/${item.gameUid}`;

  return (
    <Tooltip title={coverTooltip} enterDelay={300} placement="top">
      <Box
        component={RouterLink}
        to={to}
        sx={{
          display: 'block',
          width: '100%',
          aspectRatio: '2 / 3',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
          boxShadow: 1,
          border: 1,
          borderColor: 'divider',
          textDecoration: 'none',
          color: 'inherit',
          position: 'relative',
          transition: (theme) =>
            theme.transitions.create('border-color', {
              duration: theme.transitions.duration.short,
            }),
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <SmartImage
          imageUid={coverUid}
          thumbnail
          alt=""
          aspectRatio={2 / 3}
          fit="cover"
          sx={{
            width: '100%',
            height: '100%',
            aspectRatio: 'unset',
            display: 'block',
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
              top: 4,
              left: 4,
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: 'grey.800',
              color: 'grey.100',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}
