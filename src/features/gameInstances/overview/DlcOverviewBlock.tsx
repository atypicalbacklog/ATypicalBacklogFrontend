import { Box, Typography } from '@mui/material';
import type { DlcDto } from '../../../services/dlcApi';
import type { GameCompletionDTO } from '../../../types/dto';

interface Props {
  dlcs: DlcDto[];
  completions: GameCompletionDTO[];
  completionStateName: (uid: string) => string;
}

export default function DlcOverviewBlock({
  dlcs,
  completions,
  completionStateName,
}: Props) {
  const completionByDlc = new Map(
    completions.filter((c) => c.dlcUid).map((c) => [c.dlcUid!, c])
  );

  if (dlcs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No DLC
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        DLC
      </Typography>
      {dlcs.map((d) => {
        const comp = completionByDlc.get(d.uid);
        return (
          <Box
            key={d.uid}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ py: 0.5 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2">
              {d.name}
              {d.receivedDate ? ` · ${d.receivedDate}` : ''}
              {comp
                ? ` · ${completionStateName(comp.completionStateUid)}`
                : ''}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
