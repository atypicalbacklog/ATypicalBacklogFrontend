import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { formatPlaytime } from '../library/formatPlaytime';
import { pickDefaultInstance, otherInstances } from './instanceDisplay';
import type {
  BacklogOverviewGameDto,
  BacklogOverviewInstanceDto,
} from './types';

const THUMBNAIL_BASE = '/api/thumbnails';

interface Props {
  item: BacklogOverviewGameDto;
  expanded: boolean;
  onToggleExpand: () => void;
}

function InstanceRow({ instance }: { instance: BacklogOverviewInstanceDto }) {
  const { referenceData } = useReferenceData();
  const completionName =
    referenceData?.data.completionStates.find(
      (c) => c.uid === instance.completionStateUid
    )?.name ?? null;

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 0.5, pl: 2 }}
    >
      <Typography variant="body2" sx={{ minWidth: 120 }}>
        {instance.platformName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {instance.instanceName ?? instance.platformName}
      </Typography>
      {instance.totalPlaytimeSeconds > 0 && (
        <Typography variant="body2" color="text.secondary">
          {formatPlaytime(instance.totalPlaytimeSeconds)}
        </Typography>
      )}
      {completionName && (
        <Chip label={completionName} size="small" variant="outlined" />
      )}
      {instance.activePlaythroughUid && (
        <Chip label="Active" size="small" color="primary" />
      )}
      <Link
        component={RouterLink}
        to={`/game-instances/${instance.gameInstanceUid}`}
        variant="body2"
      >
        View
      </Link>
    </Stack>
  );
}

export default function BacklogListItem({
  item,
  expanded,
  onToggleExpand,
}: Props) {
  const defaultInstance = pickDefaultInstance(item.instances);
  const others = otherInstances(item.instances, defaultInstance);
  const hasOthers = others.length > 0;

  const thumbnailUrl = item.thumbnailImageUid
    ? `${THUMBNAIL_BASE}/${item.thumbnailImageUid}`
    : null;

  return (
    <Box border={1} borderRadius={2} p={2}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
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
          <Typography variant="subtitle1">
            <Link
              component={RouterLink}
              to={`/games/${item.gameUid}`}
              color="primary"
              underline="hover"
            >
              {item.gameName}
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Backlog · {item.backlogAddedDate}
            {item.backlogReason && ` · ${item.backlogReason}`}
          </Typography>

          {defaultInstance && (
            <Box sx={{ mt: 1 }}>
              <InstanceRow instance={defaultInstance} />
            </Box>
          )}

          {hasOthers && (
            <>
              <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={onToggleExpand}
                  aria-expanded={expanded}
                  aria-label={expanded ? 'Collapse other instances' : 'Expand other instances'}
                >
                  {expanded ? '−' : '+'}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {others.length} other instance{others.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
              <Collapse in={expanded}>
                <Stack sx={{ mt: 0.5 }}>
                  {others.map((inst) => (
                    <InstanceRow key={inst.gameInstanceUid} instance={inst} />
                  ))}
                </Stack>
              </Collapse>
            </>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {item.hasActivePlaythrough && (
            <Chip label="Active playthrough" size="small" color="primary" />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
