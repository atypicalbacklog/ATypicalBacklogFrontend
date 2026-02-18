import { Box, Typography } from '@mui/material';
import { formatPlaytime } from '../../library/formatPlaytime';
import CompletionBar from '../../shared/CompletionBar';
import type { GameCompletionDTO } from '../../../types/dto';

interface Props {
  totalSeconds: number;
  completions: GameCompletionDTO[];
  completionStateName: (uid: string) => string;
  playthroughState?: string | null;
}

export default function PlaytimeSummary({
  totalSeconds,
  completions,
  completionStateName,
  playthroughState = null,
}: Props) {
  const main = completions.filter((c) => !c.dlcUid);
  const completionState = main[0]
    ? completionStateName(main[0].completionStateUid)
    : 'Backlog';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          position: 'absolute',
          left: 0,
          right: 0,
          top: '33%',
          transform: 'translateY(-50%)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Total Playtime
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {formatPlaytime(totalSeconds)}
        </Typography>
      </Box>
      <Box sx={{ mt: 'auto', alignSelf: 'flex-start' }}>
        <CompletionBar
          completionState={completionState}
          playthroughState={playthroughState}
        />
      </Box>
    </Box>
  );
}
