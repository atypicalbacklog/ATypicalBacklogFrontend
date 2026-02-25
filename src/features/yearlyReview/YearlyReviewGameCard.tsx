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
const CARD_WIDTH_COMPACT = 100;
const CARD_HEIGHT_COMPACT = 180;
const TEXT_FONT_SIZE_DEFAULT = '1.0rem';
const TEXT_FONT_SIZE_SMALL = '0.85rem';
const TEXT_FONT_SIZE_MIN = '0.75rem';

const DEFAULT_IMAGE_HEIGHT = CARD_HEIGHT - 40;
const MIN_IMAGE_HEIGHT = 80;
const DEFAULT_IMAGE_HEIGHT_COMPACT = CARD_HEIGHT_COMPACT - 32;
const MIN_IMAGE_HEIGHT_COMPACT = 48;
const IMAGE_SHRINK_STEP_PX = 20;

interface Props {
  game: YearlyReviewGameDto;
  onEdit?: () => void;
  /** When true, use smaller card size (e.g. smartphone); font size unchanged, padding can be 0. */
  compact?: boolean;
}

interface ResolvedData {
  displayName: string;
  coverImageUid: string | null;
}

export default function YearlyReviewGameCard({ game, onEdit, compact = false }: Props) {
  const [resolved, setResolved] = useState<ResolvedData | null>(null);

  const cardWidth = compact ? CARD_WIDTH_COMPACT : CARD_WIDTH;
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT;
  const defaultImageHeight = compact ? DEFAULT_IMAGE_HEIGHT_COMPACT : DEFAULT_IMAGE_HEIGHT;
  const minImageHeight = compact ? MIN_IMAGE_HEIGHT_COMPACT : MIN_IMAGE_HEIGHT;

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
    setBaseImageHeight(defaultImageHeight);
    setTextFontSize(TEXT_FONT_SIZE_DEFAULT);
    setImageHeight(defaultImageHeight);
  }, [game.uid, imageUrl, defaultImageHeight]);

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
    const computed = Math.round(cardWidth * (h / w));
    const capped = Math.min(computed, defaultImageHeight);
    const nextBase = Math.max(minImageHeight, capped);
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
    if (imageHeight <= minImageHeight) return;

    setImageHeight((prev) => Math.max(minImageHeight, prev - IMAGE_SHRINK_STEP_PX));
  }, [game.text, textFontSize, imageHeight, minImageHeight]);

  return (
    <Box
      onClick={onEdit}
      sx={{
        width: cardWidth,
        height: cardHeight,
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
          minHeight: minImageHeight,
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
            maxWidth: cardWidth,
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
            px: compact ? 0 : 0.25,
            py: compact ? 0 : 0.25,
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
