import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { getImageUrl } from '../../services/imageApi';
import { GameApi } from '../../services/gameApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';
import type { GameDTO } from '../../types/dto';
import type { GameInstanceDetailDTO } from '../../types/dto';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 330;
const TEXT_FONT_SIZE_DEFAULT = '1.0rem';
const TEXT_FONT_SIZE_SMALL = '0.85rem';
const TEXT_FONT_SIZE_MIN = '0.75rem';

const DEFAULT_IMAGE_HEIGHT = CARD_HEIGHT - 40;
const MIN_IMAGE_HEIGHT = 80;
const IMAGE_SHRINK_STEP_PX = 20;

interface Props {
  game: YearlyReviewGameDto;
  onEdit?: () => void;
}

interface ResolvedData {
  displayName: string;
  coverImageUid: string | null;
}

export default function YearlyReviewGameCard({ game, onEdit }: Props) {
  const [resolved, setResolved] = useState<ResolvedData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const set = (data: ResolvedData) => {
      if (!cancelled) setResolved(data);
    };

    const imageUid = game.preferredImageUid;

    if (game.gameInstanceUid) {
      GameInstanceApi.get(game.gameInstanceUid)
        .then((inst: GameInstanceDetailDTO) => {
          const displayName = inst.name ?? 'Game';
          const cover = imageUid ?? inst.coverImageUid ?? null;
          if (inst.gameUid && !cover) {
            return GameApi.get(inst.gameUid).then(
              (g: GameDTO) => set({ displayName, coverImageUid: g.coverImageUid })
            );
          }
          set({ displayName, coverImageUid: cover });
        })
        .catch(() => set({ displayName: 'Game', coverImageUid: imageUid }));
      return () => {
        cancelled = true;
      };
    }

    if (game.gameUid) {
      GameApi.get(game.gameUid)
        .then((g: GameDTO) =>
          set({
            displayName: g.name,
            coverImageUid: imageUid ?? g.coverImageUid,
          })
        )
        .catch(() => set({ displayName: 'Game', coverImageUid: imageUid }));
      return () => {
        cancelled = true;
      };
    }

    set({ displayName: '—', coverImageUid: imageUid });
    return () => {
      cancelled = true;
    };
  }, [game.gameUid, game.gameInstanceUid, game.preferredImageUid]);

  const displayName = resolved?.displayName ?? '…';
  const coverUid = game.preferredImageUid ?? resolved?.coverImageUid ?? null;
  const imageUrl = getImageUrl(coverUid, true);
  const [baseImageHeight, setBaseImageHeight] = useState<number>(DEFAULT_IMAGE_HEIGHT);
  const [imageHeight, setImageHeight] = useState<number>(DEFAULT_IMAGE_HEIGHT);
  const [textFontSize, setTextFontSize] = useState(TEXT_FONT_SIZE_DEFAULT);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setBaseImageHeight(DEFAULT_IMAGE_HEIGHT);
    setTextFontSize(TEXT_FONT_SIZE_DEFAULT);
    setImageHeight(DEFAULT_IMAGE_HEIGHT);
  }, [game.uid, imageUrl]);

  // When the text changes, restore the image to its natural size first.
  useEffect(() => {
    setImageHeight(baseImageHeight);
  }, [game.text, baseImageHeight]);

  useEffect(() => {
    if (!game.text || !textRef.current) return;
    const el = textRef.current;
    if (el.scrollHeight > el.clientHeight) {
      setTextFontSize((prev) => (prev === TEXT_FONT_SIZE_DEFAULT ? TEXT_FONT_SIZE_SMALL : TEXT_FONT_SIZE_MIN));
    }
  }, [game.text, textFontSize]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth ?? 0;
    const h = img.naturalHeight ?? 0;
    if (!w || !h) {
      return;
    }

    // Compute a "natural" height for this fixed card width (preserves aspect ratio).
    // Cap it to card height, leaving a small minimum for text; we can shrink further if needed.
    const computed = Math.round(CARD_WIDTH * (h / w));
    const capped = Math.min(computed, DEFAULT_IMAGE_HEIGHT);
    const nextBase = Math.max(MIN_IMAGE_HEIGHT, capped);
    setBaseImageHeight(nextBase);
    setImageHeight(nextBase);
  };

  // If text still overflows at the minimum font size, shrink the image to make more space.
  useEffect(() => {
    if (!game.text || !textRef.current) return;
    const el = textRef.current;
    const overflow = el.scrollHeight > el.clientHeight;
    if (!overflow) return;

    if (textFontSize !== TEXT_FONT_SIZE_MIN) return;
    if (imageHeight <= MIN_IMAGE_HEIGHT) return;

    setImageHeight((prev) => Math.max(MIN_IMAGE_HEIGHT, prev - IMAGE_SHRINK_STEP_PX));
  }, [game.text, textFontSize, imageHeight]);

  return (
    <Box
      onClick={onEdit}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        flexShrink: 0,
        cursor: onEdit ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]),
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Box
        title={displayName}
        sx={{
          height: imageHeight,
          flex: '0 0 auto',
          minHeight: MIN_IMAGE_HEIGHT,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'hidden',
        }}
      >
        <Box
          component={imageUrl ? 'img' : 'div'}
          {...(imageUrl ? { src: imageUrl, alt: '', onLoad: handleImageLoad } : {})}
          sx={{
            width: '100%',
            maxWidth: CARD_WIDTH,
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'top center',
            borderRadius: 1,
          }}
        />
      </Box>
      {game.text ? (
        <Box
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            px: 0.25,
            py: 0.25,
          }}
        >
          <Typography
            ref={textRef}
            color="text.secondary"
            sx={{
              width: '100%',
              maxHeight: '100%',
              fontSize: textFontSize,
              lineHeight: 1.35,
              overflow: 'hidden',
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
            title={game.text}
          >
            {game.text}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
