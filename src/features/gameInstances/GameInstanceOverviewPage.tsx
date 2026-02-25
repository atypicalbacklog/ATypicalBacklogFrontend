import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { GameApi } from '../../services/gameApi';
import { DlcApi } from '../../services/dlcApi';
import { PlaythroughApi } from '../../services/playthroughApi';
import { ReviewsApi } from '../../services/reviewsApi';
import { getTimeBookingsByPlaythrough } from '../../services/timeBookingApi';
import { HltbApi, type HltbEstimateDto } from '../../services/hltbApi';
import { getTierColorByIndex } from '../../constants/tierColors';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type {
  GameInstanceDetailDTO,
  GameDTO,
  GameInstanceSummaryDto,
  PlaythroughQueryResultDto,
  ReviewByUidDto,
} from '../../types/dto';
import type { DlcDto } from '../../services/dlcApi';
import { totalDurationSeconds } from './overview/timeBookingUtils';
import type { PlaythroughWithTime } from './overview/PlaythroughGallery';
import GameInfoBlock from './overview/GameInfoBlock';
import BacklogInfoBlock from './overview/BacklogInfoBlock';
import InstanceTabs from './overview/InstanceTabs';
import CoverWithTabs from './overview/CoverWithTabs';
import InstanceDetailsCard from './overview/InstanceDetailsCard';
import InstanceDetailBottomBlock from './overview/InstanceDetailBottomBlock';
import DlcOverviewBlock from './overview/DlcOverviewBlock';
import PlaytimeSummary from './overview/PlaytimeSummary';
import HowLongToBeatBlock from './overview/HowLongToBeatBlock';
import PlaythroughGallery from './overview/PlaythroughGallery';
import ReviewOverviewBlock from './overview/ReviewOverviewBlock';
import ImageGallery from './overview/ImageGallery';

export default function GameInstanceOverviewPage() {
  const { uid } = useParams<{ uid: string }>();
  const { referenceData, isLoaded } = useReferenceData();
  const [instance, setInstance] = useState<GameInstanceDetailDTO | null>(null);
  const [game, setGame] = useState<GameDTO | null>(null);
  const [instances, setInstances] = useState<GameInstanceSummaryDto[]>([]);
  const [dlcs, setDlcs] = useState<DlcDto[]>([]);
  const [playthroughs, setPlaythroughs] = useState<PlaythroughQueryResultDto[]>(
    []
  );
  const [playthroughsWithTime, setPlaythroughsWithTime] = useState<
    PlaythroughWithTime[]
  >([]);
  const [totalPlaytimeSeconds, setTotalPlaytimeSeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastPlayedIso, setLastPlayedIso] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewByUidDto[]>([]);
  const [hltbEstimate, setHltbEstimate] = useState<HltbEstimateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (instanceUid: string) => {
    const inst = await GameInstanceApi.get(instanceUid);
    setInstance(inst);

    let gameData: GameDTO | null = null;
    if (inst.gameUid) {
      gameData = await GameApi.get(inst.gameUid);
      setGame(gameData);
      const list = await GameApi.getInstances(inst.gameUid);
      setInstances(list);
    } else {
      setGame(null);
      setInstances([]);
    }

    const [dlcList, playthroughList] = await Promise.all([
      DlcApi.getByGameInstance(instanceUid),
      PlaythroughApi.findByGameInstance(instanceUid),
    ]);
    setDlcs(dlcList);
    setPlaythroughs(playthroughList);

    const byPlaythrough = new Map<string, DlcDto>();
    dlcList.forEach((d) => {
      if (d.playthroughUid) byPlaythrough.set(d.playthroughUid, d);
    });

    const bookingsByPlaythrough = await Promise.all(
      playthroughList.map((p) =>
        getTimeBookingsByPlaythrough(p.playthroughUid).then((bookings) => ({
          playthrough: p,
          bookings,
        }))
      )
    );

    let totalSec = 0;
    let sessions = 0;
    let lastPlayed: string | null = null;

    const withTime: PlaythroughWithTime[] = playthroughList
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
      .map((p) => {
        const { bookings } =
          bookingsByPlaythrough.find(
            (x) => x.playthrough.playthroughUid === p.playthroughUid
          ) ?? { bookings: [] };
        const sec = totalDurationSeconds(bookings);
        totalSec += sec;
        sessions += bookings.length;
        bookings.forEach((b) => {
          const end = b.endTime ?? new Date().toISOString();
          if (!lastPlayed || end > lastPlayed) lastPlayed = end;
        });
        return {
          playthrough: p,
          totalSeconds: sec,
          dlcName: byPlaythrough.get(p.playthroughUid)?.name ?? null,
          sessions: bookings,
        };
      });

    setPlaythroughsWithTime(withTime);
    setTotalPlaytimeSeconds(totalSec);
    setSessionCount(sessions);
    setLastPlayedIso(lastPlayed);

    ReviewsApi.getByGameInstance(instanceUid)
      .then(setReviews)
      .catch(() => setReviews([]));

    HltbApi.getByGameInstance(instanceUid)
      .then(setHltbEstimate)
      .catch(() => setHltbEstimate(null));
  }, []);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    loadData(uid).catch(() => setError('Failed to load game instance')).finally(() => setLoading(false));
  }, [uid, loadData]);

  if (!isLoaded) return null;
  if (loading) return <CircularProgress />;
  if (error && !instance)
    return <Typography color="error">{error}</Typography>;
  if (!instance)
    return <Typography color="error">Game instance not found</Typography>;

  const platforms = referenceData?.data.platforms ?? [];
  const variants = referenceData?.data.variants ?? [];
  const consoles = referenceData?.data.consoles ?? [];
  const playthroughTypes = referenceData?.data.playthroughTypes ?? [];
  const playthroughStates = referenceData?.data.playthroughStates ?? [];
  const inputs = referenceData?.data.inputs ?? [];
  const completionStates = referenceData?.data.completionStates ?? [];

  const platform = platforms.find((p) => p.uid === instance.platformUid);
  const platformName = platform?.name ?? instance.platformUid;
  const platformConsoleName =
    platform != null
      ? (consoles.find((c) => c.uid === platform.consoleUid)?.name ?? '')
      : '';
  const variantName =
    variants.find((v) => v.uid === instance.variantUid)?.name ?? instance.variantUid;
  const originalConsoleName =
    instance.originalConsoleUid != null && instance.originalConsoleUid !== ''
      ? (consoles.find((c) => c.uid === instance.originalConsoleUid)?.fullname ??
         consoles.find((c) => c.uid === instance.originalConsoleUid)?.name ??
         instance.originalConsoleUid)
      : null;
  const typeName = (u: string) =>
    playthroughTypes.find((t) => t.uid === u)?.name ?? u;
  const stateName = (u: string) =>
    playthroughStates.find((s) => s.uid === u)?.name ?? u;
  const inputName = (u: string) =>
    inputs.find((i) => i.uid === u)?.name ?? u;
  const completionStateName = (u: string) =>
    completionStates.find((c) => c.uid === u)?.name ?? u;
  const activeStateUid = playthroughStates.find((s) => s.name === 'Active')?.uid;
  const instancePlaythroughState =
    activeStateUid && playthroughsWithTime.some((p) => p.playthrough.playthroughStateUid === activeStateUid)
      ? 'Active'
      : null;
  const tiers = (referenceData?.data?.tiers ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const tierName = (u: string | null) =>
    u ? tiers.find((t) => t.uid === u)?.name ?? u : '—';
  const getTierColor = (tierUid: string | null) => {
    const idx = tierUid != null ? tiers.findIndex((t) => t.uid === tierUid) : -1;
    return getTierColorByIndex(idx >= 0 ? idx : 0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, width: '100%' }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button component={Link} to="/library" size="small">
          Back to Library
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Top header: Game name + Edit left, Backlog panel right — same width as instance panel */}
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          p: 2,
          width: '100%',
          maxWidth: { xs: 480, sm: 1200 },
          minWidth: 0,
          mx: { xs: 'auto', sm: 0 },
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {game ? (
            <GameInfoBlock game={game} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No game linked
            </Typography>
          )}
          {game && (
            <Tooltip title="Edit Game">
              <IconButton
                component={Link}
                to={`/games/${game.uid}`}
                size="small"
                aria-label="Edit Game"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            minWidth: { xs: '100%', sm: 520 },
            maxWidth: 620,
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          }}
        >
          <BacklogInfoBlock entries={instance.backlogEntries ?? []} />
        </Paper>
      </Paper>

      {/* One panel: Instance tabs + Edit + per-instance content */}
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          width: '100%',
          maxWidth: { xs: 480, sm: 1200 },
          minWidth: 0,
          mx: { xs: 'auto', sm: 0 },
          overflow: 'hidden',
          boxSizing: 'border-box',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, pt: 1, flexWrap: 'wrap' }}>
          {instances.length > 0 ? (
            <InstanceTabs
              instances={instances}
              currentUid={instance.uid}
              getInstanceLabel={(inst) =>
                inst.name || (inst.uid === instance.uid ? variantName : inst.uid)
              }
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 0.5 }}>
              {instance.name || instance.uid}
            </Typography>
          )}
          <Tooltip title="Edit Instance">
            <IconButton
              component={Link}
              to={`/game-instances/${uid}/edit`}
              size="small"
              aria-label="Edit Instance"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ p: 2, minWidth: 0 }}>
          {/* Per-instance content: Left | Right */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start" sx={{ mb: 3 }}>
            {/* Left area: Image left, Data right */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                width: { xs: '100%', md: 650 },
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'center', sm: 'stretch' }} sx={{ minHeight: { xs: 'auto', sm: 280 } }}>
                <CoverWithTabs instance={instance} game={game} instances={instances} />
                <Stack
                  direction="column"
                  spacing={2}
                  sx={{ minWidth: 0, flex: 1, justifyContent: 'space-between' }}
                >
                  <InstanceDetailsCard
                    instance={instance}
                    variantName={variantName}
                    platformName={platformName}
                    platformConsoleName={platformConsoleName}
                    originalConsoleName={originalConsoleName}
                    leftSection
                  />
                  <DlcOverviewBlock
                    dlcs={dlcs}
                    completions={instance.completions}
                    completionStateName={completionStateName}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Right area: fixed width top and bottom */}
            <Stack spacing={2} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    width: { xs: '100%', sm: 250 },
                    height: { xs: 140, sm: 180 },
                    minHeight: { xs: 140 },
                    boxSizing: 'border-box',
                    bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                  }}
                >
                  <PlaytimeSummary
                    totalSeconds={totalPlaytimeSeconds}
                    completions={instance.completions}
                    completionStateName={completionStateName}
                    playthroughState={instancePlaythroughState}
                  />
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    width: { xs: '100%', sm: 250 },
                    height: { xs: 140, sm: 180 },
                    minHeight: { xs: 140 },
                    boxSizing: 'border-box',
                    bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                  }}
                >
                  <HowLongToBeatBlock
                    gameInstanceUid={instance.uid}
                    gameName={game?.name ?? ''}
                    instanceName={instance.name}
                    estimate={hltbEstimate}
                    onSaved={() =>
                      HltbApi.getByGameInstance(instance.uid)
                        .then(setHltbEstimate)
                        .catch(() => setHltbEstimate(null))
                    }
                  />
                </Paper>
              </Stack>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  width: { xs: '100%', sm: 500 },
                  boxSizing: 'border-box',
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                }}
              >
                <InstanceDetailBottomBlock
                  sessionCount={sessionCount}
                  totalSeconds={totalPlaytimeSeconds}
                  lastPlayedIso={lastPlayedIso}
                  receivedDate={instance.receivedDate}
                  completions={instance.completions}
                />
              </Paper>
            </Stack>
          </Stack>

          {/* Playthrough list */}
          <Box sx={{ mb: 3, minWidth: 0 }}>
            <Typography variant="subtitle1" gutterBottom>
              Playthroughs
            </Typography>
            <PlaythroughGallery
              items={playthroughsWithTime}
              typeName={typeName}
              stateName={stateName}
              inputName={inputName}
            />
          </Box>

          {/* Reviews */}
          <Box sx={{ mb: 3, minWidth: 0 }}>
            <ReviewOverviewBlock
              reviews={reviews}
              gameInstanceUid={instance.uid}
              typeName={(uid) => (uid ? typeName(uid) : '—')}
              stateName={stateName}
              tierName={tierName}
              getTierColor={getTierColor}
            />
          </Box>

          {/* Image gallery */}
          {game?.uid && (
            <Box>
              <ImageGallery gameUid={game.uid} gameInstanceUid={uid} />
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
