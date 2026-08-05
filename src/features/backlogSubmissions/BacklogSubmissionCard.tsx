import { useLayoutEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SmartImage from '../shared/SmartImage';
import SubmissionStateBorderFrame from './backlogSubmissionBorderFrame';
import { getSubmissionImageBorder } from './backlogSubmissionStateLabels';

/** Match library card width so cover art keeps a similar 2:3-ish frame. */
export const BACKLOG_SUBMISSION_CARD_WIDTH = 200;
const MOBILE_CARD_WIDTH = 170;
/** Title strip under the cover — keep the original compact height. */
const TITLE_AREA_HEIGHT = 40;
const COVER_HEIGHT = 260;
const MOBILE_COVER_HEIGHT = 220;
const CARD_HEIGHT = COVER_HEIGHT + TITLE_AREA_HEIGHT;
const MOBILE_CARD_HEIGHT = MOBILE_COVER_HEIGHT + TITLE_AREA_HEIGHT;
/** Pixels per second for the marquee scroll. */
const MARQUEE_PX_PER_SEC = 28;

const BADGE_SX = {
  borderRadius: 1,
  px: 0.875,
  py: 0.3,
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

interface Props {
  name: string;
  imageUid: string | null;
  /** Fallback cover when no linked game image UID is available. */
  externalCoverUrl?: string | null;
  voteCount: number;
  voteRank?: number;
  state?: string | null;
  onClick?: () => void;
}

function MarqueeTitle({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const measure = () => {
      const next = textEl.scrollWidth - container.clientWidth;
      setOverflowPx(next > 1 ? next : 0);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(textEl);
    return () => observer.disconnect();
  }, [text]);

  const durationSec =
    overflowPx > 0 ? Math.max(4, (overflowPx * 2) / MARQUEE_PX_PER_SEC + 2.5) : 0;

  return (
    <Box ref={containerRef} sx={{ width: '100%', overflow: 'hidden', minWidth: 0 }}>
      <Typography
        ref={textRef}
        component="span"
        variant="body2"
        fontWeight={600}
        title={text}
        sx={{
          display: 'inline-block',
          maxWidth: 'none',
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          ...(overflowPx > 0
            ? {
                animation: `backlogSubmissionTitleMarquee ${durationSec}s ease-in-out infinite`,
                '@keyframes backlogSubmissionTitleMarquee': {
                  '0%, 12%': { transform: 'translateX(0)' },
                  '45%, 55%': { transform: `translateX(-${overflowPx}px)` },
                  '88%, 100%': { transform: 'translateX(0)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }
            : undefined),
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default function BacklogSubmissionCard({
  name,
  imageUid,
  externalCoverUrl = null,
  voteCount,
  voteRank,
  state,
  onClick,
}: Props) {
  const imageBorder = getSubmissionImageBorder(state);
  const showExternalCover = !imageUid && Boolean(externalCoverUrl);

  return (
    <Box
      onClick={onClick}
      sx={{
        width: { xs: MOBILE_CARD_WIDTH, sm: BACKLOG_SUBMISSION_CARD_WIDTH },
        height: { xs: MOBILE_CARD_HEIGHT, sm: CARD_HEIGHT },
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        boxShadow: 1,
        border: 1,
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        transition: (theme) =>
          theme.transitions.create('border-color', {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': onClick
          ? {
              borderColor: 'primary.main',
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: '100%',
          height: { xs: MOBILE_COVER_HEIGHT, sm: COVER_HEIGHT },
          overflow: 'hidden',
        }}
      >
        <SubmissionStateBorderFrame
          border={imageBorder}
          borderRadius={0}
          innerBg="transparent"
          sx={{ width: '100%', height: '100%' }}
        >
          {showExternalCover ? (
            <Box
              component="img"
              src={externalCoverUrl!}
              alt=""
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[900]
                    : theme.palette.grey[200],
              }}
            />
          ) : (
            <SmartImage
              imageUid={imageUid}
              thumbnail
              alt=""
              aspectRatio={2 / 3}
              fit="contain"
              placeholderLabel={name}
              sx={{
                width: '100%',
                height: '100%',
                aspectRatio: 'unset',
                borderRadius: 0,
              }}
              imgSx={{ borderRadius: 0 }}
            />
          )}
        </SubmissionStateBorderFrame>
        {/* Rank and vote count always visible, including when upvotes are disabled by state. */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            right: 6,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pointerEvents: 'none',
          }}
        >
          {voteRank != null ? (
            <Box
              sx={{
                ...BADGE_SX,
                bgcolor: 'rgba(0,0,0,0.65)',
                color: 'grey.400',
              }}
            >
              #{voteRank}
            </Box>
          ) : (
            <span />
          )}
          <Box
            sx={{
              ...BADGE_SX,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.35,
              bgcolor: 'rgba(0,0,0,0.65)',
              color: '#fff',
            }}
          >
            <ArrowUpwardIcon sx={{ fontSize: 18 }} />
            {voteCount}
          </Box>
        </Box>
      </Box>
      <Stack
        sx={{
          px: 1,
          py: 0.75,
          flex: 1,
          minHeight: 0,
          justifyContent: 'center',
          minWidth: 0,
        }}
      >
        <MarqueeTitle text={name} />
      </Stack>
    </Box>
  );
}
