import { Box, Typography } from '@mui/material';
import type { GameCompletionDTO } from '../../../types/dto';

interface Props {
  /** Main completions (dlcUid null) for this instance. */
  completions: GameCompletionDTO[];
  completionStateName: (uid: string) => string;
}

export default function CurrentCompletionBlock({
  completions,
  completionStateName,
}: Props) {
  const main = completions.filter((c) => !c.dlcUid);

  if (main.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No completion set
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Completion
      </Typography>
      {main.map((c) => (
        <Typography key={c.uid} variant="body2">
          {completionStateName(c.completionStateUid)}
          {c.info ? ` · ${c.info}` : ''}
        </Typography>
      ))}
    </Box>
  );
}
