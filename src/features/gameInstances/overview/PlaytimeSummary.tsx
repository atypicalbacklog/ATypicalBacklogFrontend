import { Box, Typography } from '@mui/material';
import { formatPlaytime } from '../../library/formatPlaytime';

interface Props {
  totalSeconds: number;
  sessionCount: number;
  lastPlayedIso: string | null;
}

export default function PlaytimeSummary({
  totalSeconds,
  sessionCount,
  lastPlayedIso,
}: Props) {
  const avgSeconds =
    sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0;

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Playtime
      </Typography>
      <Typography variant="body2">
        Total: {formatPlaytime(totalSeconds)}
      </Typography>
      <Typography variant="body2">
        Avg session: {formatPlaytime(avgSeconds)}
      </Typography>
      <Typography variant="body2">
        Last played:{' '}
        {lastPlayedIso
          ? new Date(lastPlayedIso).toLocaleDateString()
          : '—'}
      </Typography>
    </Box>
  );
}
