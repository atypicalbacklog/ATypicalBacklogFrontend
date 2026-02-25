import { Link } from 'react-router-dom';
import { TableCell, TableRow, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import CompletionBar from '../shared/CompletionBar';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
import { pickDefaultInstance } from './instanceDisplay';
import type { BacklogOverviewGameDto } from './types';

const thumbSx = { width: 20, height: 28, flexShrink: 0, borderRadius: 0.5 };

interface Props {
  item: BacklogOverviewGameDto;
  backlogCount: number;
  compactColumns?: boolean;
  cellPaddingSx?: { px: number };
}

export default function BacklogListItemMinimized({
  item,
  backlogCount,
  compactColumns = false,
  cellPaddingSx = { px: 1 },
}: Props) {
  const { referenceData } = useReferenceData();
  const defaultInstance = pickDefaultInstance(item.instances);
  const singleInstance = item.instances.length === 1 ? item.instances[0] : null;
  const instance = defaultInstance ?? singleInstance ?? null;

  const completionName =
    instance?.completionStateUid != null && referenceData?.data.completionStates
      ? referenceData.data.completionStates.find(
          (c) => c.uid === instance.completionStateUid
        )?.name ?? null
      : null;
  const playthroughStateName =
    instance?.activePlaythroughUid != null
      ? 'Active'
      : instance?.playthroughs?.[0]?.playthroughStateUid != null && referenceData?.data.playthroughStates
        ? referenceData.data.playthroughStates.find(
            (s) => s.uid === instance.playthroughs?.[0]?.playthroughStateUid
          )?.name ?? null
        : null;
  const hasActivePlaythrough = instance?.activePlaythroughUid != null;

  const toHref =
    defaultInstance != null
      ? `/game-instances/${defaultInstance.gameInstanceUid}`
      : undefined;

  const baseCellSx = (extra?: object) => ({ ...cellPaddingSx, ...extra });

  const content = (
    <>
      <TableCell align="right" sx={baseCellSx({ width: 40 })}>
        #{backlogCount}
      </TableCell>
      <TableCell align="right" sx={baseCellSx({ width: 56 })}>
        {item.backlogScore}
      </TableCell>
      <TableCell sx={baseCellSx({ width: 36 })}>
        {item.coverImageUid ? (
          <SmartImage
            imageUid={item.coverImageUid}
            alt=""
            thumbnail
            sx={thumbSx}
          />
        ) : (
          <span style={{ display: 'inline-block', width: 20, height: 28 }} />
        )}
      </TableCell>
      <TableCell sx={baseCellSx()}>
        <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: compactColumns ? 120 : 180 }}>
          {item.gameName}
        </Typography>
      </TableCell>
      {!compactColumns && (
        <>
          <TableCell sx={baseCellSx()}>
            {item.gameReleaseDate ? (
              <DateWithIcon date={item.gameReleaseDate} tooltip="Release Date" />
            ) : (
              '–'
            )}
          </TableCell>
          <TableCell sx={baseCellSx()}>
            <Typography variant="caption" color="text.secondary">
              {item.backlogAddedDate}
            </Typography>
          </TableCell>
        </>
      )}
      <TableCell sx={baseCellSx()}>
        {instance != null ? (
          <Typography variant="body2" color="text.secondary">
            {instance.platformName}
          </Typography>
        ) : (
          '–'
        )}
      </TableCell>
      <TableCell align="center" sx={baseCellSx({ width: 44 })}>
        {instance != null && hasActivePlaythrough ? (
          <CheckCircleIcon color="primary" fontSize="small" titleAccess="Active playthrough" />
        ) : (
          '–'
        )}
      </TableCell>
      {!compactColumns && (
        <TableCell sx={baseCellSx()}>
          <CompletionBar
            completionState={completionName ?? 'Backlog'}
            playthroughState={playthroughStateName}
          />
        </TableCell>
      )}
    </>
  );

  if (toHref) {
    return (
      <TableRow
        component={Link}
        to={toHref}
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {content}
      </TableRow>
    );
  }

  return (
    <TableRow sx={{ bgcolor: 'background.paper' }}>
      {content}
    </TableRow>
  );
}
