import { keyframes } from '@emotion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import LandingHeroFooter from '../LandingHeroFooter';
import {
  LANDING_HERO_CURSOR_TEXT_GAP,
  LANDING_HERO_LINE_HEIGHT,
  LANDING_HERO_LONGEST_PHRASE,
  LANDING_HERO_PHRASES,
  LANDING_HERO_TITLE_TEXT_SX,
} from '../landingHeroConstants';

const CYCLE_MS = 2000;
const TRANSITION_MS = 450;

const titleTextSx = {
  ...LANDING_HERO_TITLE_TEXT_SX,
  color: 'grey.100',
} as const;

const titleLayerSx = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
} as const;

const cursorBlink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const slideOutUp = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
`;

const slideInFromBottom = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

/** Archived hero variant — not used on the landing page. */
export default function LandingPageHeroTypeA() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCycleTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionRef.current != null) {
      clearTimeout(transitionRef.current);
      transitionRef.current = null;
    }
  }, []);

  const scheduleCycle = useCallback(
    (fromIndex: number) => {
      clearCycleTimer();
      timerRef.current = setTimeout(() => {
        const next = (fromIndex + 1) % LANDING_HERO_PHRASES.length;
        setIncomingIndex(next);
        setIsTransitioning(true);
        transitionRef.current = setTimeout(() => {
          setPhraseIndex(next);
          setIncomingIndex(null);
          setIsTransitioning(false);
          scheduleCycle(next);
        }, TRANSITION_MS);
      }, CYCLE_MS);
    },
    [clearCycleTimer, clearTransitionTimer]
  );

  const startTransition = useCallback(() => {
    if (isTransitioning) return;
    clearCycleTimer();
    clearTransitionTimer();
    const next = (phraseIndex + 1) % LANDING_HERO_PHRASES.length;
    setIncomingIndex(next);
    setIsTransitioning(true);
    transitionRef.current = setTimeout(() => {
      setPhraseIndex(next);
      setIncomingIndex(null);
      setIsTransitioning(false);
      scheduleCycle(next);
    }, TRANSITION_MS);
  }, [
    phraseIndex,
    isTransitioning,
    clearCycleTimer,
    clearTransitionTimer,
    scheduleCycle,
  ]);

  useEffect(() => {
    scheduleCycle(phraseIndex);
    return () => {
      clearCycleTimer();
      clearTransitionTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const outgoingPhrase = LANDING_HERO_PHRASES[phraseIndex];
  const incomingPhrase =
    incomingIndex != null ? LANDING_HERO_PHRASES[incomingIndex] : null;

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        role="button"
        tabIndex={0}
        onClick={startTransition}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startTransition();
          }
        }}
        aria-label="Toggle site title animation"
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          cursor: 'pointer',
          userSelect: 'none',
          outline: 'none',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'grey.500',
            outlineOffset: 4,
            borderRadius: 0.5,
          },
        }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{
            flexShrink: 0,
            width: '1.25ch',
            fontFamily: 'monospace',
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 700,
            color: 'grey.300',
            animation: `${cursorBlink} 1s step-end infinite`,
            lineHeight: LANDING_HERO_LINE_HEIGHT,
          }}
        >
          &gt;
        </Box>

        <Box
          sx={{
            position: 'relative',
            ml: LANDING_HERO_CURSOR_TEXT_GAP,
            height: LANDING_HERO_LINE_HEIGHT,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'inline-block',
          }}
        >
          <Typography
            variant="h4"
            component="div"
            aria-hidden
            sx={{
              ...titleTextSx,
              visibility: 'hidden',
              pointerEvents: 'none',
            }}
          >
            {LANDING_HERO_LONGEST_PHRASE}
          </Typography>
          <Box
            sx={{
              ...titleLayerSx,
              animation: isTransitioning
                ? `${slideOutUp} ${TRANSITION_MS}ms ease forwards`
                : 'none',
            }}
          >
            <Typography variant="h4" component="span" sx={titleTextSx}>
              {outgoingPhrase}
            </Typography>
          </Box>
          {isTransitioning && incomingPhrase != null ? (
            <Box
              sx={{
                ...titleLayerSx,
                animation: `${slideInFromBottom} ${TRANSITION_MS}ms ease forwards`,
              }}
            >
              <Typography variant="h4" component="span" sx={titleTextSx}>
                {incomingPhrase}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      <LandingHeroFooter />
    </Box>
  );
}
