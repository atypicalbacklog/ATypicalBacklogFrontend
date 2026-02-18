import { Box, Stack, Typography } from '@mui/material';
import { formatPlaytime } from '../../library/formatPlaytime';
import DateWithIcon from '../../shared/DateWithIcon';
import type { GameCompletionDTO } from '../../../types/dto';

interface Props {
  sessionCount: number;
  totalSeconds: number;
  lastPlayedIso: string | null;
  receivedDate: string | null;
  completions: GameCompletionDTO[];
}

export default function InstanceDetailBottomBlock({
  sessionCount,
  totalSeconds,
  lastPlayedIso,
  receivedDate,
  completions,
}: Props) {
  const avgSeconds =
    sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0;
  const main = completions.filter((c) => !c.dlcUid);

  return (
    <Box sx={{ flexShrink: 0, lineHeight: 1.3, '& .MuiTypography-root': { lineHeight: 1.35 } }}>
      <Stack direction="row" spacing={2} sx={{ mb: 0.5 }} justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Played{' '}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {sessionCount}
          </Box>{' '}
          session{sessionCount !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
          Ø Playtime:{' '}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {formatPlaytime(avgSeconds)}
          </Box>
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <DateWithIcon date={receivedDate} tooltip="Received" variant="body2" />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
          Last played:{' '}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {lastPlayedIso
              ? new Date(lastPlayedIso).toLocaleDateString()
              : '—'}
          </Box>
        </Typography>
      </Box>
      {main[0]?.info && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {main[0].info}
        </Typography>
      )}
    </Box>
  );
}
