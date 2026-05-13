import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { formatPlaytime } from '../../library/formatPlaytime';
import CompletionBar from '../../shared/CompletionBar';
import DateWithIcon from '../../shared/DateWithIcon';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const main = completions.filter((c) => !c.dlcUid);
  const completionState = main[0]
    ? completionStateName(main[0].completionStateUid)
    : 'Backlog';
  const finishedDate = main[0]?.finishedDate ?? null;
  const completedDate = main[0]?.completedDate ?? null;

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
          top: isMobile ? '30%' : '33%',
          transform: 'translateY(-50%)',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={isMobile ? { fontSize: '0.8125rem' } : undefined}>
          Total Playtime
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={isMobile ? { fontSize: '1rem' } : undefined}>
          {formatPlaytime(totalSeconds)}
        </Typography>
      </Box>
      <Box sx={{ mt: 'auto', alignSelf: 'stretch', width: '100%' }}>
        {(finishedDate || completedDate) && (
          <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', width: '100%' }}>
            {finishedDate && (
              <DateWithIcon date={finishedDate} tooltip="Finished Date" variant="caption" iconSize={14} />
            )}
            {completedDate && (
              <DateWithIcon
                date={completedDate}
                tooltip="Completed Date"
                variant="caption"
                iconSize={14}
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>
        )}
        <CompletionBar
          completionState={completionState}
          playthroughState={playthroughState}
          size={isMobile ? 'small' : 'medium'}
        />
      </Box>
    </Box>
  );
}
