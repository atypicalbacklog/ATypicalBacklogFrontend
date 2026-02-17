import { Box, Tooltip, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface Props {
  /** Date string to display (e.g. YYYY-MM-DD), or null/undefined for "—". */
  date: string | null | undefined;
  /** Tooltip text shown on hover (e.g. "Release Date", "Received", "Added"). */
  tooltip: string;
  /** Typography variant for the date. Default "caption". */
  variant?: 'caption' | 'body2' | 'body1';
  /** Icon size in px. Default 16. */
  iconSize?: number;
  /** Optional extra sx for the root. */
  sx?: object;
}

export default function DateWithIcon({
  date,
  tooltip,
  variant = 'caption',
  iconSize = 16,
  sx = {},
}: Props) {
  const displayDate = date ?? '—';

  return (
    <Tooltip title={tooltip}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'text.secondary',
          ...sx,
        }}
      >
        <CalendarMonthIcon sx={{ fontSize: iconSize }} />
        <Typography variant={variant} component="span">
          {displayDate}
        </Typography>
      </Box>
    </Tooltip>
  );
}
