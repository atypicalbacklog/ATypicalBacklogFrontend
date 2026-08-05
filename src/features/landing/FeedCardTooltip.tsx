import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { useFeedTooltipOptional } from './FeedTooltipContext';

interface Props {
  title: ReactNode;
  children: ReactNode;
}

type FrozenPopperAnchor = {
  anchorReference: 'anchorPosition';
  anchorPosition: { top: number; left: number };
};

/** Hover tooltip on desktop; tap on touch. Stays put when the card scrolls away; closes after focus is lost. */
export default function FeedCardTooltip({ title, children }: Props) {
  const theme = useTheme();
  const isTouch =
    useMediaQuery(theme.breakpoints.down('sm')) || useMediaQuery('(pointer: coarse)');
  const tooltipCtx = useFeedTooltipOptional();
  const tooltipId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [frozenPopperAnchor, setFrozenPopperAnchor] = useState<FrozenPopperAnchor | null>(
    null
  );

  const controlled = tooltipCtx != null;
  const isOpen = controlled
    ? tooltipCtx.activeId === tooltipId
    : isTouch
      ? localOpen
      : false;

  const tooltipTitle = useMemo(() => title, [title]);

  const capturePopperAnchor = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setFrozenPopperAnchor({
      anchorReference: 'anchorPosition',
      anchorPosition: {
        top: rect.top,
        left: rect.left + rect.width / 2,
      },
    });
  };

  const closeTooltip = () => {
    if (controlled) {
      tooltipCtx.closeAll();
    } else {
      setLocalOpen(false);
    }
    setFrozenPopperAnchor(null);
  };

  const scheduleCloseTooltip = () => {
    if (controlled) {
      tooltipCtx.scheduleClose();
    } else {
      window.setTimeout(() => setLocalOpen(false), 1500);
    }
  };

  const openTooltip = () => {
    if (controlled) {
      tooltipCtx.open(tooltipId);
    } else {
      setLocalOpen(true);
    }
  };

  const toggleTooltip = () => {
    if (isOpen) {
      closeTooltip();
      return;
    }
    openTooltip();
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setFrozenPopperAnchor(null);
      return;
    }
    capturePopperAnchor();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isTouch) return;
    const onDocumentPointerDown = () => {
      if (controlled && tooltipCtx) {
        tooltipCtx.scheduleClose();
      } else {
        window.setTimeout(() => setLocalOpen(false), 1500);
      }
    };
    const id = window.setTimeout(() => {
      document.addEventListener('pointerdown', onDocumentPointerDown);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('pointerdown', onDocumentPointerDown);
    };
  }, [isOpen, isTouch, controlled, tooltipCtx]);

  return (
    <Tooltip
      title={tooltipTitle}
      open={controlled || isTouch ? isOpen : undefined}
      disableHoverListener={controlled || isTouch}
      disableFocusListener={controlled || isTouch}
      disableTouchListener
      enterDelay={0}
      leaveDelay={0}
      placement="top"
      onClose={closeTooltip}
      PopperProps={{
        ...(frozenPopperAnchor ?? {}),
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, -8] },
          },
        ],
      }}
      slotProps={{ tooltip: { sx: { maxWidth: 300 } } }}
    >
      <Box
        ref={anchorRef}
        onMouseEnter={controlled && !isTouch ? openTooltip : undefined}
        onMouseLeave={controlled && !isTouch ? scheduleCloseTooltip : undefined}
        onClick={
          isTouch
            ? (e) => {
                e.stopPropagation();
                toggleTooltip();
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
