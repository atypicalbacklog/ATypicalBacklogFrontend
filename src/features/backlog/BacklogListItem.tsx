import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { getImageUrl } from '../../services/imageApi';
import CompletionBar from '../shared/CompletionBar';
import VariantConsolePlatformDisplay, {
  getVariantConsolePlatformDisplayProps,
} from '../shared/VariantConsolePlatformDisplay';
import { pickDefaultInstance, otherInstances } from './instanceDisplay';
import type {
  BacklogOverviewGameDto,
  BacklogOverviewInstanceDto,
} from './types';

interface Props {
  item: BacklogOverviewGameDto;
  backlogCount?: number;
  expanded: boolean;
  onToggleExpand: () => void;
}

function InstanceRow({
  instance,
  gameName,
  gameReleaseDate,
}: {
  instance: BacklogOverviewInstanceDto;
  gameName: string;
  gameReleaseDate: string | null;
}) {
  const { referenceData } = useReferenceData();
  const completionName =
    referenceData?.data.completionStates.find(
      (c) => c.uid === instance.completionStateUid
    )?.name ?? null;
  const playthroughStateName =
    instance.activePlaythroughUid
      ? 'Active'
      : instance.playthroughs?.[0]?.playthroughStateUid
        ? (referenceData?.data.playthroughStates.find(
            (s) => s.uid === instance.playthroughs?.[0]?.playthroughStateUid
          )?.name ?? null)
        : null;
  const variantConsolePlatformDisplay = getVariantConsolePlatformDisplayProps(
    {
      platformUid: instance.platformUid,
      variantUid: instance.variantUid,
      originalConsoleUid: instance.originalConsoleUid,
    },
    referenceData
  );

  const thumbnailUrl = instance.coverImageUid
    ? getImageUrl(instance.coverImageUid, true)
    : null;

  const instanceNameDifferent = instance.instanceName != null && instance.instanceName !== gameName;
  const releaseDateDifferent =
    instance.releaseDate != null &&
    instance.releaseDate !== (gameReleaseDate ?? '');

  const playthroughs = instance.playthroughs ?? [];
  const dlcNames = instance.dlcNames ?? [];

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      component={RouterLink}
      to={`/game-instances/${instance.gameInstanceUid}`}
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(4px)',
        border: '1px solid',
        borderColor: 'divider',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {thumbnailUrl && (
        <Box
          component="img"
          src={thumbnailUrl}
          alt=""
          width={40}
          height={40}
          sx={{ objectFit: 'cover', borderRadius: 0.5, bgcolor: 'grey.300', flexShrink: 0 }}
        />
      )}
      <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
        {(instanceNameDifferent || releaseDateDifferent) && (
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {instanceNameDifferent && (
              <Typography variant="body2" fontWeight="medium" color="primary">
                {instance.instanceName}
              </Typography>
            )}
            {releaseDateDifferent && (
              <Typography variant="caption" color="text.secondary">
                {instance.releaseDate}
              </Typography>
            )}
          </Stack>
        )}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center" useFlexGap>
          <Typography variant="body2" color="text.secondary" component="div">
            <VariantConsolePlatformDisplay
              {...variantConsolePlatformDisplay}
              variant="body2"
              color="text.secondary"
            />
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center" useFlexGap>
          <CompletionBar
            completionState={completionName ?? 'Backlog'}
            playthroughState={playthroughStateName}
          />
          {playthroughs.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {playthroughs.map((p, idx) => {
                const typeName =
                  p.playthroughTypeUid &&
                  referenceData?.data.playthroughTypes.find((t) => t.uid === p.playthroughTypeUid)?.name;
                const stateName =
                  p.playthroughStateUid &&
                  referenceData?.data.playthroughStates.find((s) => s.uid === p.playthroughStateUid)?.name;
                const label = [typeName, stateName, p.startedAt].filter(Boolean).join(' · ') || `Playthrough ${idx + 1}`;
                return (
                  <Chip key={idx} label={label} size="small" variant="outlined" sx={{ height: 20 }} />
                );
              })}
            </Stack>
          )}
          {dlcNames.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              DLC: {dlcNames.join(', ')}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function BacklogListItem({
  item,
  backlogCount,
  expanded,
  onToggleExpand,
}: Props) {
  const defaultInstance = pickDefaultInstance(item.instances);
  const others = otherInstances(item.instances, defaultInstance);
  const hasOthers = others.length > 0;

  const thumbnailUrl = getImageUrl(item.coverImageUid, true);

  return (
    <Box
      border={1}
      borderRadius={2}
      borderColor="divider"
      sx={{
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack direction="row" spacing={0} alignItems="stretch">
        {/* Left: Main segment */}
        <Box sx={{ flex: '1 1 0', minWidth: 200, maxWidth: 360, p: 1.5, borderRight: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5, whiteSpace: 'nowrap' }}>
              #{backlogCount ?? '—'} / SCORE {item.backlogScore}
            </Typography>
            {thumbnailUrl ? (
              <Box
                component="img"
                src={thumbnailUrl}
                alt=""
                width={64}
                height={64}
                sx={{ objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.300', flexShrink: 0 }}
              />
            ) : (
              <Box
                width={64}
                height={64}
                bgcolor="grey.300"
                sx={{ borderRadius: 1, flexShrink: 0 }}
              />
            )}
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2">
                {item.gameName}
              </Typography>
              {item.gameReleaseDate && (
                <Typography variant="caption" color="text.secondary">
                  {item.gameReleaseDate}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Added {item.backlogAddedDate}
                {item.backlogReason ? ` · ${item.backlogReason}` : ''}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Right: GameInstance segment */}
        <Box sx={{ flex: '1 1 0', minWidth: 200, p: 1.5 }}>
          {item.instances.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No instances
            </Typography>
          ) : item.instances.length === 1 ? (
            <InstanceRow
              instance={item.instances[0]}
              gameName={item.gameName}
              gameReleaseDate={item.gameReleaseDate}
            />
          ) : (
            <Stack spacing={0.75}>
              {defaultInstance && (
                <InstanceRow
                  instance={defaultInstance}
                  gameName={item.gameName}
                  gameReleaseDate={item.gameReleaseDate}
                />
              )}
              {hasOthers && (
                <>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={onToggleExpand}
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Collapse other instances' : 'Expand other instances'}
                    >
                      {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {others.length} other instance{others.length !== 1 ? 's' : ''}
                    </Typography>
                  </Stack>
                  <Collapse in={expanded}>
                    <Stack spacing={0.5}>
                      {others.map((inst) => (
                        <InstanceRow
                          key={inst.gameInstanceUid}
                          instance={inst}
                          gameName={item.gameName}
                          gameReleaseDate={item.gameReleaseDate}
                        />
                      ))}
                    </Stack>
                  </Collapse>
                </>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
