import { Box, Typography } from '@mui/material';
import CompletionBar from '../../shared/CompletionBar';
import type { GameCompletionDTO } from '../../../types/dto';

interface Props {
  /** Main completions (dlcUid null) for this instance. */
  completions: GameCompletionDTO[];
  completionStateName: (uid: string) => string;
  /** Playthrough state name for the bar border (e.g. Active). Omit when not available. */
  playthroughState?: string | null;
}

export default function CurrentCompletionBlock({
  completions,
  completionStateName,
  playthroughState = null,
}: Props) {
  const main = completions.filter((c) => !c.dlcUid);
  const completionState = main[0]
    ? completionStateName(main[0].completionStateUid)
    : 'Backlog';

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Completion
      </Typography>
      <CompletionBar
        completionState={completionState}
        playthroughState={playthroughState}
      />
      {main[0]?.info && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {main[0].info}
        </Typography>
      )}
    </Box>
  );
}
