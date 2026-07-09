import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ff7Cursor from '../../assets/FF7Cursor.webp';
import selectionSound from '../../assets/deck_ui_misc_10.wav';
import LandingHeroFooter from './LandingHeroFooter';
import {
  LANDING_HERO_CURSOR_TEXT_GAP,
  LANDING_HERO_PHRASES,
  LANDING_HERO_TITLE_TO_FOOTER_GAP,
  LANDING_HERO_TYPE_B_LINE_HEIGHT,
  LANDING_HERO_TYPE_B_TITLE_TEXT_SX,
  landingHeroWindowSx,
} from './landingHeroConstants';

const CURSOR_SLOT_WIDTH = { xs: 28, sm: 40 } as const;
const CURSOR_IMAGE_HEIGHT = { xs: 22, sm: 32 } as const;

export default function LandingPageHeroTypeB() {
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.floor(Math.random() * LANDING_HERO_PHRASES.length)
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(selectionSound);
    audioRef.current.preload = 'auto';
    return () => {
      audioRef.current = null;
    };
  }, []);

  const selectLine = useCallback((index: number) => {
    setSelectedIndex((current) => {
      if (current === index) return current;
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
      return index;
    });
  }, []);

  return (
    <Box sx={{ pt: { xs: 2.5, sm: 0 }, pb: { xs: 1, sm: 1.5 }, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: LANDING_HERO_TITLE_TO_FOOTER_GAP,
        }}
      >
        <Box
          component="div"
          role="listbox"
          aria-label="Site title"
          sx={{
            ...landingHeroWindowSx,
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            maxWidth: '100%',
          }}
        >
          {LANDING_HERO_PHRASES.map((phrase, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Box
                key={phrase}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => {
                  if (!isSelected) selectLine(index);
                }}
                onFocus={() => {
                  if (!isSelected) selectLine(index);
                }}
                tabIndex={isSelected ? 0 : -1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: LANDING_HERO_TYPE_B_LINE_HEIGHT,
                  flexShrink: 0,
                  cursor: isSelected ? 'default' : 'pointer',
                  outline: 'none',
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'grey.500',
                    outlineOffset: 2,
                    borderRadius: 0.5,
                  },
                }}
              >
                <Box
                  sx={{
                    width: CURSOR_SLOT_WIDTH,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: LANDING_HERO_CURSOR_TEXT_GAP,
                  }}
                >
                  {isSelected ? (
                    <Box
                      component="img"
                      src={ff7Cursor}
                      alt=""
                      sx={{
                        height: CURSOR_IMAGE_HEIGHT,
                        width: 'auto',
                        display: 'block',
                        imageRendering: 'pixelated',
                      }}
                    />
                  ) : null}
                </Box>
                <Typography
                  component="span"
                  sx={{
                    ...LANDING_HERO_TYPE_B_TITLE_TEXT_SX,
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'right',
                    color: isSelected ? 'grey.100' : 'grey.600',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {phrase}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <LandingHeroFooter />
    </Box>
  );
}
