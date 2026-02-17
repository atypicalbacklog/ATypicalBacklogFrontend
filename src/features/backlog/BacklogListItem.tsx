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
import CompletionBar from '../shared/CompletionBar';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
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
  gameCoverImageUid,
}: {
  instance: BacklogOverviewInstanceDto;
  gameName: string;
  gameReleaseDate: string | null;
  gameCoverImageUid: string | null;
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

  const instanceNameDifferent = instance.instanceName != null && instance.instanceName !== gameName;
  const releaseDateDifferent =
    instance.releaseDate != null &&
    instance.releaseDate !== (gameReleaseDate ?? '');
  const hasHeaderRow = instanceNameDifferent || releaseDateDifferent;

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
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.grey[800]
            : theme.palette.grey[50],
        border: '1px solid',
        borderColor: 'divider',
        textDecoration: 'none',
        color: 'inherit',
        transition: (theme) => theme.transitions.create('border-color', {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      {instance.coverImageUid && instance.coverImageUid !== gameCoverImageUid ? (
        <SmartImage
          imageUid={instance.coverImageUid}
          thumbnail
          alt=""
          aspectRatio={2 / 3}
          fit="contain"
          sx={{ width: 40, height: 40, borderRadius: 0.5, flexShrink: 0 }}
          imgSx={{ borderRadius: 0.5 }}
          showPlaceholder={false}
        />
      ) : null}
      <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
        {(instanceNameDifferent || releaseDateDifferent) && (
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {instanceNameDifferent && (
              <Typography variant="body2" fontWeight="medium" color="primary">
                {instance.instanceName}
              </Typography>
            )}
            {releaseDateDifferent && (
              <DateWithIcon date={instance.releaseDate} tooltip="Release Date" />
            )}
          </Stack>
        )}
        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="wrap"
          alignItems="center"
          useFlexGap
          sx={{ mt: hasHeaderRow ? 0.25 : 0.75 }}
        >
          <Typography variant="body2" color="text.secondary" component="div" sx={{ flex: 1, minWidth: 0 }}>
            <VariantConsolePlatformDisplay
              {...variantConsolePlatformDisplay}
              variant="body2"
              color="text.secondary"
            />
          </Typography>
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-end',
              alignSelf: 'stretch',
            }}
          >
            <CompletionBar
              completionState={completionName ?? 'Backlog'}
              playthroughState={playthroughStateName}
            />
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center" useFlexGap>
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

  return (
    <Box
      border={1}
      borderRadius={2}
      borderColor="divider"
      sx={{
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        position: 'relative',
      }}
    >
      {/* Order number overlay (top left) */}
      {backlogCount != null && (
        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            fontStyle: 'italic',
            opacity: 0.35,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          #{backlogCount}
        </Typography>
      )}
      <Stack direction="row" spacing={0} alignItems="stretch">
        {/* Left: Main segment */}
        <Box
          sx={{
            flex: '1 1 0',
            minWidth: 220,
            maxWidth: 400,
            p: 1.5,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
            {/* Score to the left of image */}
            <Typography
              variant="h6"
              fontWeight={600}
              title="Calculated Backlog Importance Score"
              sx={{
                minWidth: 40,
                textAlign: 'right',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                alignSelf: 'stretch',
              }}
            >
              {item.backlogScore}
            </Typography>
            <SmartImage
              imageUid={item.coverImageUid}
              thumbnail
              alt=""
              aspectRatio={2 / 3}
              fit="contain"
              sx={{ width: 100, height: 133, borderRadius: 1, flexShrink: 0 }}
              imgSx={{ borderRadius: 1 }}
            />
            <Stack
              spacing={0.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography variant="subtitle1">
                {item.gameName}
              </Typography>
              {item.gameReleaseDate && (
                <DateWithIcon date={item.gameReleaseDate} tooltip="Release Date" />
              )}
              <Box
                sx={{
                  pt: 3, // clear visual gap from name + release date
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    In backlog since:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.backlogAddedDate}
                  </Typography>
                </Box>
                {item.backlogReason && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {item.backlogReason}
                  </Typography>
                )}
              </Box>
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
              gameCoverImageUid={item.coverImageUid}
            />
          ) : (
            <Stack spacing={0.75}>
              {defaultInstance && (
                <InstanceRow
                  instance={defaultInstance}
                  gameName={item.gameName}
                  gameReleaseDate={item.gameReleaseDate}
                  gameCoverImageUid={item.coverImageUid}
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
                          gameCoverImageUid={item.coverImageUid}
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
