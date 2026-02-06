import { Box, Typography } from '@mui/material';
import type { BacklogEntryDTO } from '../../../types/dto';

interface Props {
  /** All backlog entries (current + history), newest first. */
  entries: BacklogEntryDTO[];
}

function daysBetween(a: string, b: string | null): number {
  const d1 = new Date(a);
  const d2 = b ? new Date(b) : new Date();
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export default function BacklogInfoBlock({ entries }: Props) {
  const current = entries.find((e) => !e.removedDate);
  const sorted = [...entries].sort(
    (a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
  );

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Backlog
      </Typography>
      <Typography variant="body2" gutterBottom>
        {current ? 'In backlog' : 'Not in backlog'}
      </Typography>
      {current && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Days in backlog: {daysBetween(current.addedDate, current.removedDate)}
          {current.reason ? ` · ${current.reason}` : ''}
        </Typography>
      )}
      {sorted.length > 0 && (
        <Box
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            mt: 1,
          }}
        >
          {sorted.map((e) => (
            <Typography
              key={e.uid}
              variant="body2"
              component="div"
              sx={{ py: 0.5 }}
            >
              {e.addedDate}
              {e.removedDate != null ? ` – ${e.removedDate}` : ' (current)'}
              {e.reason ? ` · ${e.reason}` : ''}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
