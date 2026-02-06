import { Box, Typography } from '@mui/material';
import type { PlaythroughQueryResultDto } from '../../../types/dto';
import type { DlcDto } from '../../../services/dlcApi';
import PlaythroughOverviewCard from './PlaythroughOverviewCard';

export interface PlaythroughWithTime {
  playthrough: PlaythroughQueryResultDto;
  totalSeconds: number;
  dlcName: string | null;
}

interface Props {
  items: PlaythroughWithTime[];
  typeName: (uid: string) => string;
  stateName: (uid: string) => string;
  inputName: (uid: string) => string;
}

export default function PlaythroughGallery({
  items,
  typeName,
  stateName,
  inputName,
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
      }}
    >
      {items.map(({ playthrough, totalSeconds, dlcName }) => (
        <PlaythroughOverviewCard
          key={playthrough.playthroughUid}
          playthroughUid={playthrough.playthroughUid}
          typeName={typeName(playthrough.playthroughTypeUid)}
          stateName={stateName(playthrough.playthroughStateUid)}
          startedAt={playthrough.startedAt}
          inputName={inputName(playthrough.inputUid ?? '')}
          totalSeconds={totalSeconds}
          dlcName={dlcName}
        />
      ))}
    </Box>
  );
}
