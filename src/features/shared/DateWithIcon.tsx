import { useEffect, useState } from 'react';
import { Box, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const isTouch = useMediaQuery(theme.breakpoints.down('sm')) || useMediaQuery('(pointer: coarse)');
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    if (!tooltipOpen) return;
    const close = () => setTooltipOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [tooltipOpen]);

  return (
    <Tooltip
      title={tooltip}
      disableHoverListener={isTouch}
      disableFocusListener={isTouch}
      disableTouchListener={isTouch}
      open={isTouch ? tooltipOpen : undefined}
      onClose={() => setTooltipOpen(false)}
    >
      <Box
        component="span"
        onClick={(e) => {
          if (isTouch) {
            e.stopPropagation();
            setTooltipOpen((o) => !o);
          }
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'text.secondary',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          cursor: isTouch ? 'pointer' : undefined,
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
