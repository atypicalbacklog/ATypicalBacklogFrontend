import { Box, Typography } from '@mui/material';
import CompletionBar from '../../shared/CompletionBar';
import DateWithIcon from '../../shared/DateWithIcon';
import SmartImage from '../../shared/SmartImage';
import type { DlcDto } from '../../../services/dlcApi';
import type { GameCompletionDTO } from '../../../types/dto';

const MAX_VISIBLE_DLC_ROWS = 2;

interface Props {
  dlcs: DlcDto[];
  completions: GameCompletionDTO[];
  completionStateName: (uid: string) => string;
}

function DlcRow({
  d,
  completionState,
}: {
  d: DlcDto;
  completionState: string;
}) {
  const coverUid = d.coverImageUid ?? null;
  return (
    <Box display="flex" alignItems="flex-start" gap={1} sx={{ py: 0.75 }}>
      <Box sx={{ flexShrink: 0 }}>
        <SmartImage
          imageUid={coverUid}
          thumbnail
          alt=""
          aspectRatio={2 / 3}
          fit="cover"
          sx={{ width: 45, height: 60, borderRadius: 0.5 }}
          imgSx={{ borderRadius: 0.5 }}
        />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" fontWeight="medium" sx={{ display: 'block' }}>
          {d.name}
        </Typography>
        <Box sx={{ mb: 0.5 }}>
          <DateWithIcon date={d.releaseDate} tooltip="Release Date" />
        </Box>
        <Box sx={{ display: 'block' }}>
          <CompletionBar completionState={completionState} playthroughState={null} />
        </Box>
      </Box>
    </Box>
  );
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

  const scrollList = dlcs.length > MAX_VISIBLE_DLC_ROWS;

  const rows = dlcs.map((d) => {
    const comp = completionByDlc.get(d.uid);
    const completionStateUid = d.completionStateUid ?? comp?.completionStateUid ?? null;
    const completionState = completionStateUid
      ? completionStateName(completionStateUid)
      : 'Backlog';
    return <DlcRow key={d.uid} d={d} completionState={completionState} />;
  });

  if (!scrollList) {
    return (
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          DLC
        </Typography>
        {rows}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: { sm: 1 },
        minHeight: { sm: 0 },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ flexShrink: 0 }}>
        DLC
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>{rows}</Box>
    </Box>
  );
}
