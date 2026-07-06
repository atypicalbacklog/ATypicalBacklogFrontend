import { Box, Typography } from '@mui/material';
import type { PlaythroughQueryResultDto, TimeBookingQueryDto } from '../../../types/dto';
import PlaythroughOverviewCard from './PlaythroughOverviewCard';

export interface PlaythroughWithTime {
  playthrough: PlaythroughQueryResultDto;
  totalSeconds: number;
  dlcName: string | null;
  /** Time booking sessions for this playthrough (from api/playthroughs/{uid}/sessions or query/time-bookings). */
  sessions: TimeBookingQueryDto[];
}

interface Props {
  items: PlaythroughWithTime[];
  typeName: (uid: string) => string;
  stateName: (uid: string) => string;
  inputName: (uid: string) => string;
  readOnly?: boolean;
}

export default function PlaythroughGallery({
  items,
  typeName,
  stateName,
  inputName,
  readOnly = false,
}: Props) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No playthroughs
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        pb: 1,
        minWidth: 0,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {items.map(({ playthrough, totalSeconds, dlcName, sessions }) => (
        <PlaythroughOverviewCard
          key={playthrough.playthroughUid}
          playthroughUid={playthrough.playthroughUid}
          typeName={typeName(playthrough.playthroughTypeUid)}
          stateName={stateName(playthrough.playthroughStateUid)}
          startedAt={playthrough.startedAt}
          inputName={inputName(playthrough.inputUid ?? '')}
          totalSeconds={totalSeconds}
          dlcName={dlcName}
          sessions={sessions}
          readOnly={readOnly}
        />
      ))}
    </Box>
  );
}
