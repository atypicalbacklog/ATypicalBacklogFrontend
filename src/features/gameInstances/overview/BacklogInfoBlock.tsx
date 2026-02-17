import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        {/* Left: status + reason */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: { xs: '100%', sm: 240 },
            flex: { xs: '1 1 auto', sm: '0 0 auto' },
          }}
        >
          {current ? (
            <>
              <Typography variant="body2">
                Currently in Backlog since {daysBetween(current.addedDate, current.removedDate)} Days
              </Typography>
              {current.reason && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Reason: {current.reason}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Not Part of Backlog
            </Typography>
          )}
        </Box>

        {/* Right: table of all entries, max-height 100px, scroll, vertically centered */}
        {sorted.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: 0,
              flex: { xs: '1 1 auto', sm: '1 1 340px' },
              minWidth: { xs: '100%', sm: 340 },
            }}
          >
            <TableContainer
              sx={{
                maxHeight: 100,
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'transparent',
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead
                  sx={{
                    '& th': {
                      py: 0.4,
                      px: 0.75,
                      fontSize: '0.7rem',
                      lineHeight: 1.2,
                      minHeight: 0,
                      borderBottom: 1,
                      borderColor: 'divider',
                    },
                  }}
                >
                  <TableRow sx={{ '& th': { bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100') } }}>
                    <TableCell variant="head" align="center" sx={{ width: 170 }}>
                      From – To
                    </TableCell>
                    <TableCell variant="head" sx={{ width: 56 }}>
                      Days
                    </TableCell>
                    <TableCell variant="head">
                      Reason
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.map((e) => {
                    const days = daysBetween(e.addedDate, e.removedDate);
                    return (
                      <TableRow key={e.uid}>
                        <TableCell sx={{ py: 0.25, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {e.addedDate} – {e.removedDate ?? '-'}
                        </TableCell>
                        <TableCell sx={{ py: 0.25, fontSize: '0.75rem' }}>{days}</TableCell>
                        <TableCell sx={{ py: 0.25, fontSize: '0.75rem' }}>
                          {e.reason || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
}
