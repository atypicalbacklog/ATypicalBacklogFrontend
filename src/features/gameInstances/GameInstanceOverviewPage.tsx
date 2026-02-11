import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { GameApi } from '../../services/gameApi';
import { DlcApi } from '../../services/dlcApi';
import { PlaythroughApi } from '../../services/playthroughApi';
import { ReviewsApi } from '../../services/reviewsApi';
import { getTimeBookingsByPlaythrough } from '../../services/timeBookingApi';
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
import InstanceSwitcher from './overview/InstanceSwitcher';
import CoverImage from './overview/CoverImage';
import InstanceDetailsCard from './overview/InstanceDetailsCard';
import CurrentCompletionBlock from './overview/CurrentCompletionBlock';
import DlcOverviewBlock from './overview/DlcOverviewBlock';
import PlaytimeSummary from './overview/PlaytimeSummary';
import HowLongToBeatPlaceholder from './overview/HowLongToBeatPlaceholder';
import PlaythroughGallery from './overview/PlaythroughGallery';
import ReviewOverviewBlock from './overview/ReviewOverviewBlock';
import ImageGalleryPlaceholder from './overview/ImageGalleryPlaceholder';

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
        };
      });

    setPlaythroughsWithTime(withTime);
    setTotalPlaytimeSeconds(totalSec);
    setSessionCount(sessions);
    setLastPlayedIso(lastPlayed);

    ReviewsApi.getByGameInstance(instanceUid)
      .then(setReviews)
      .catch(() => setReviews([]));
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
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button component={Link} to="/" size="small">
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Top header: Game info (left), Backlog info (right), Edit game link */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}
      >
        {game ? (
          <GameInfoBlock game={game} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No game linked
          </Typography>
        )}
        <Box flex={1} maxWidth={400}>
          <BacklogInfoBlock entries={instance.backlogEntries ?? []} />
        </Box>
        {game && (
          <Typography
            component={Link}
            to={`/games/${game.uid}`}
            variant="body2"
          >
            ✎ Edit game
          </Typography>
        )}
      </Stack>

      {/* Instance switcher + Edit instance link */}
      <Box sx={{ mb: 2 }} display="flex" alignItems="center" gap={2}>
        {game && instances.length > 0 && (
          <InstanceSwitcher
            instances={instances}
            currentUid={instance.uid}
            currentVariantConsoleDisplay={{
              variantName,
              platformName,
              platformConsoleName,
              originalConsoleName,
            }}
          />
        )}
        <Typography
          component={Link}
          to={`/game-instances/${uid}/edit`}
          variant="body2"
        >
          ✎ Edit instance
        </Typography>
      </Box>

      {/* Area 1: Cover, instance details, completion, DLC */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        <CoverImage game={game} instance={instance} />
        <Stack spacing={2} flex={1}>
          <InstanceDetailsCard
            instance={instance}
            variantName={variantName}
            platformName={platformName}
            platformConsoleName={platformConsoleName}
            originalConsoleName={originalConsoleName}
          />
          <CurrentCompletionBlock
            completions={instance.completions}
            completionStateName={completionStateName}
            playthroughState={instancePlaythroughState}
          />
          <DlcOverviewBlock
            dlcs={dlcs}
            completions={instance.completions}
            completionStateName={completionStateName}
          />
        </Stack>
      </Stack>

      {/* Area 2: Playtime & playthrough gallery */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Playthrough & playtime
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ mb: 2 }}
        >
          <PlaytimeSummary
            totalSeconds={totalPlaytimeSeconds}
            sessionCount={sessionCount}
            lastPlayedIso={lastPlayedIso}
          />
          <HowLongToBeatPlaceholder />
        </Stack>
        <PlaythroughGallery
          items={playthroughsWithTime}
          typeName={typeName}
          stateName={stateName}
          inputName={inputName}
        />
      </Box>

      {/* Area 3: Reviews */}
      <Box sx={{ mb: 4 }}>
        <ReviewOverviewBlock
          reviews={reviews}
          gameInstanceUid={instance.uid}
          typeName={(uid) => (uid ? typeName(uid) : '—')}
          stateName={stateName}
          tierName={tierName}
          getTierColor={getTierColor}
        />
      </Box>

      {/* Area 4: Image gallery placeholder */}
      <Box>
        <ImageGalleryPlaceholder />
      </Box>
    </Box>
  );
}
