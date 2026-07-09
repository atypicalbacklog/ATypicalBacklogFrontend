import { useEffect, useMemo, useState } from 'react';
import { Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  children: ReactNode;
}

/** Hover tooltip on desktop; tap-to-toggle on touch (works inside scroll galleries). */
export default function FeedCardTooltip({ title, children }: Props) {
  const theme = useTheme();
  const isTouch =
    useMediaQuery(theme.breakpoints.down('sm')) || useMediaQuery('(pointer: coarse)');
  const [open, setOpen] = useState(false);

  const tooltipTitle = useMemo(() => title, [title]);

  useEffect(() => {
    if (!open || !isTouch) return;
    const close = () => setOpen(false);
    const id = window.setTimeout(() => {
      document.addEventListener('click', close);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('click', close);
    };
  }, [open, isTouch]);

  return (
    <Tooltip
      title={tooltipTitle}
      open={isTouch ? open : undefined}
      disableHoverListener={isTouch}
      disableFocusListener={isTouch}
      disableTouchListener
      enterDelay={isTouch ? 0 : 400}
      leaveDelay={isTouch ? 0 : 200}
      onClose={() => setOpen(false)}
      slotProps={{ tooltip: { sx: { maxWidth: 300 } } }}
    >
      <Box
        onClick={
          isTouch
            ? (e) => {
                e.stopPropagation();
                setOpen((prev) => !prev);
              }
            : undefined
        }
        sx={{ display: 'block', width: 'fit-content' }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
