import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import GameImageMissingPlaceholder from '../shared/GameImageMissingPlaceholder';
import { getImageUrl } from '../../services/imageApi';
import { GameApi } from '../../services/gameApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';
import type { GameDTO, GameInstanceDetailDTO, YearlyReviewGamePresentationType } from '../../types/dto';
import {
  isSideImagePresentation,
  normalizeYearlyReviewGamePresentationType,
  yearlyReviewSideCardWidth,
  yearlyReviewSideImageHeight,
  yearlyReviewSideImageMaxWidth,
  yearlyReviewSideImageWidth,
  yearlyReviewSideLayoutFontSize,
  yearlyReviewSideUsesLargeImage,
} from './yearlyReviewGamePresentationUtils';

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

function useResolvedGame(game: YearlyReviewGameDto): ResolvedData | null {
  const [resolved, setResolved] = useState<ResolvedData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResolved(null);

    const set = (data: ResolvedData) => {
      if (!cancelled) setResolved(data);
    };

    const imageUid = game.preferredImageUid;

    if (game.gameInstanceUid) {
      (async () => {
        try {
          const inst: GameInstanceDetailDTO = await GameInstanceApi.get(game.gameInstanceUid!);
          let displayName = inst.name ?? 'Game';
          let cover = imageUid ?? inst.coverImageUid ?? null;

          if (inst.gameUid && (!inst.name || !inst.name.trim() || !cover)) {
            try {
              const g: GameDTO = await GameApi.get(inst.gameUid);
              if (!inst.name || !inst.name.trim()) {
                displayName = g.name;
              }
              if (!cover) {
                cover = g.coverImageUid ?? null;
              }
            } catch {
              // ignore game fetch failure; keep whatever we have
            }
          }

          set({ displayName, coverImageUid: cover });
        } catch {
          set({ displayName: 'Game', coverImageUid: imageUid });
        }
      })();
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

  return resolved;
}

function cardShellSx(onEdit?: () => void): SxProps<Theme> {
  return {
    flexShrink: 0,
    cursor: onEdit ? 'pointer' : 'default',
    overflow: 'hidden',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
    border: '2px solid',
    borderColor: 'divider',
    borderRadius: 1,
  };
}

function SideLayoutCard({
  game,
  resolved,
  presentationType,
  onEdit,
  compact,
}: {
  game: YearlyReviewGameDto;
  resolved: ResolvedData | null;
  presentationType: YearlyReviewGamePresentationType;
  onEdit?: () => void;
  compact: boolean;
}) {
  const displayName = resolved?.displayName ?? '…';
  const coverUid = game.preferredImageUid ?? resolved?.coverImageUid ?? null;
  const imageUrl = getImageUrl(coverUid, true);
  const cardWidth = yearlyReviewSideCardWidth(game.text, compact);
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT;
  const usesLargeImage = yearlyReviewSideUsesLargeImage(game.text);
  const maxImageWidth = yearlyReviewSideImageMaxWidth(game.text, compact);
  const fixedImageWidth = yearlyReviewSideImageWidth(compact);
  const fixedImageHeight = yearlyReviewSideImageHeight(compact);
  const maxImageHeight = cardHeight - (compact ? 8 : 16);
  const textFontSize = yearlyReviewSideLayoutFontSize(game.text, compact);
  const imageOnLeft = presentationType === 'IMAGE_LEFT';

  const sideImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [scaledImageHeight, setScaledImageHeight] = useState<number>(fixedImageHeight);

  const applySideImageHeight = (img: HTMLImageElement) => {
    const w = img.naturalWidth ?? 0;
    const h = img.naturalHeight ?? 0;
    if (!w || !h) return;
    const displayW = Math.min(maxImageWidth, w);
    const displayH = Math.round(displayW * (h / w));
    setScaledImageHeight(Math.min(displayH, maxImageHeight));
  };

  useEffect(() => {
    setScaledImageHeight(fixedImageHeight);
    setImageLoadFailed(false);
  }, [game.uid, game.text, imageUrl, usesLargeImage, fixedImageHeight]);

  useLayoutEffect(() => {
    if (!usesLargeImage || !imageUrl) return;
    const img = sideImageRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      applySideImageHeight(img);
    }
  }, [imageUrl, usesLargeImage, maxImageWidth, maxImageHeight, game.uid, fixedImageHeight]);

  const handleSideImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!usesLargeImage) return;
    applySideImageHeight(e.currentTarget);
  };

  const imageBlockWidth = usesLargeImage ? maxImageWidth : fixedImageWidth;
  const imageBlockHeight = usesLargeImage ? scaledImageHeight : fixedImageHeight;

  const imageBlock = (
    <Box
      title={displayName}
      sx={{
        width: imageBlockWidth,
        flexShrink: 0,
        height: imageBlockHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {!imageUrl || imageLoadFailed ? (
        <GameImageMissingPlaceholder
          sx={{
            width: usesLargeImage ? maxImageWidth : '100%',
            height: '100%',
            maxHeight: usesLargeImage ? maxImageHeight : '100%',
            borderRadius: 1,
          }}
        />
      ) : (
        <Box
          component="img"
          ref={sideImageRef}
          src={imageUrl}
          alt=""
          onLoad={handleSideImageLoad}
          onError={() => setImageLoadFailed(true)}
          sx={{
            maxWidth: maxImageWidth,
            width: usesLargeImage ? 'auto' : '100%',
            height: usesLargeImage ? 'auto' : '100%',
            maxHeight: usesLargeImage ? maxImageHeight : '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );

  const textBlock = game.text ? (
    <Box
      sx={{
        flex: compact ? '0 1 auto' : '1 1 0',
        minWidth: 0,
        height: compact ? 'auto' : '100%',
        display: 'flex',
        alignItems: compact ? 'flex-start' : 'center',
        px: compact ? 0.75 : 1.25,
        py: compact ? 0.5 : 0.75,
        ...(compact ? { overflow: 'auto', maxHeight: 240 } : {}),
      }}
    >
      <Typography
        color="text.secondary"
        sx={{
          width: '100%',
          maxHeight: compact ? 'none' : '100%',
          fontSize: textFontSize,
          lineHeight: 1.4,
          overflow: compact ? 'visible' : 'hidden',
          textAlign: compact ? 'left' : 'left',
          wordBreak: 'break-word',
        }}
        title={game.text}
      >
        {game.text}
      </Typography>
    </Box>
  ) : (
    <Box sx={{ flex: 1, minWidth: 0 }} />
  );

  if (compact) {
    return (
      <Box
        onClick={onEdit}
        sx={{
          ...cardShellSx(onEdit),
          width: '100%',
          maxWidth: '100%',
          minHeight: cardHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          {imageBlock}
        </Box>
        {textBlock}
      </Box>
    );
  }

  return (
    <Box
      onClick={onEdit}
      sx={{
        ...cardShellSx(onEdit),
        width: cardWidth,
        height: cardHeight,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {imageOnLeft ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {imageBlock}
        </>
      )}
    </Box>
  );
}

function DefaultLayoutCard({
  game,
  resolved,
  onEdit,
  compact,
}: {
  game: YearlyReviewGameDto;
  resolved: ResolvedData | null;
  onEdit?: () => void;
  compact: boolean;
}) {
  const cardWidth = compact ? CARD_WIDTH_COMPACT : CARD_WIDTH;
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT;
  const defaultImageHeight = compact ? DEFAULT_IMAGE_HEIGHT_COMPACT : DEFAULT_IMAGE_HEIGHT;
  const minImageHeight = compact ? MIN_IMAGE_HEIGHT_COMPACT : MIN_IMAGE_HEIGHT;

  const displayName = resolved?.displayName ?? '…';
  const coverUid = game.preferredImageUid ?? resolved?.coverImageUid ?? null;
  const imageUrl = getImageUrl(coverUid, true);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [baseImageHeight, setBaseImageHeight] = useState<number>(defaultImageHeight);
  const [imageHeight, setImageHeight] = useState<number>(defaultImageHeight);
  const [textFontSize, setTextFontSize] = useState(TEXT_FONT_SIZE_DEFAULT);
  const textRef = useRef<HTMLParagraphElement>(null);
  const defaultImageRef = useRef<HTMLImageElement | null>(null);

  const applyDefaultImageHeight = (img: HTMLImageElement) => {
    const w = img.naturalWidth ?? 0;
    const h = img.naturalHeight ?? 0;
    if (!w || !h) return;
    const computed = Math.round(cardWidth * (h / w));
    const capped = Math.min(computed, defaultImageHeight);
    const nextBase = Math.max(minImageHeight, capped);
    setBaseImageHeight(nextBase);
    setImageHeight(nextBase);
  };

  useEffect(() => {
    setBaseImageHeight(defaultImageHeight);
    setTextFontSize(TEXT_FONT_SIZE_DEFAULT);
    setImageHeight(defaultImageHeight);
    setImageLoadFailed(false);
  }, [game.uid, game.text, imageUrl, defaultImageHeight]);

  useEffect(() => {
    setImageHeight(baseImageHeight);
  }, [game.text, baseImageHeight]);

  // Measure after layout + image area updates; double rAF avoids stale clientHeight on first paint.
  useEffect(() => {
    if (!game.text || !textRef.current) return;
    let cancelled = false;
    let frame = 0;

    const measure = () => {
      if (cancelled || !textRef.current) return;
      const el = textRef.current;
      if (el.clientHeight <= 0) return;
      if (el.scrollHeight <= el.clientHeight) return;
      setTextFontSize((prev) =>
        prev === TEXT_FONT_SIZE_DEFAULT ? TEXT_FONT_SIZE_SMALL : TEXT_FONT_SIZE_MIN
      );
    };

    frame = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [game.text, game.uid, imageHeight, textFontSize]);

  useLayoutEffect(() => {
    if (!imageUrl) return;
    const img = defaultImageRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      applyDefaultImageHeight(img);
    }
  }, [imageUrl, game.uid, cardWidth, defaultImageHeight, minImageHeight]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    applyDefaultImageHeight(e.currentTarget);
  };

  useEffect(() => {
    if (!game.text || !textRef.current) return;
    let cancelled = false;
    let frame = 0;

    const measure = () => {
      if (cancelled || !textRef.current) return;
      const el = textRef.current;
      if (el.clientHeight <= 0) return;
      if (el.scrollHeight <= el.clientHeight) return;
      if (textFontSize !== TEXT_FONT_SIZE_MIN) return;
      if (imageHeight <= minImageHeight) return;
      setImageHeight((prev) => Math.max(minImageHeight, prev - IMAGE_SHRINK_STEP_PX));
    };

    frame = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [game.text, game.uid, textFontSize, imageHeight, minImageHeight]);

  return (
    <Box
      onClick={onEdit}
      sx={{
        ...cardShellSx(onEdit),
        width: cardWidth,
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
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
        {!imageUrl || imageLoadFailed ? (
          <GameImageMissingPlaceholder
            sx={{
              width: '100%',
              maxWidth: cardWidth,
              height: '100%',
              borderRadius: 1,
            }}
          />
        ) : (
          <Box
            component="img"
            ref={defaultImageRef}
            src={imageUrl}
            alt=""
            onLoad={handleImageLoad}
            onError={() => setImageLoadFailed(true)}
            sx={{
              width: '100%',
              maxWidth: cardWidth,
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'top center',
              borderRadius: 1,
            }}
          />
        )}
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

export default function YearlyReviewGameCard({ game, onEdit, compact = false }: Props) {
  const resolved = useResolvedGame(game);
  const presentationType = normalizeYearlyReviewGamePresentationType(game.presentationType);

  if (isSideImagePresentation(presentationType)) {
    return (
      <SideLayoutCard
        game={game}
        resolved={resolved}
        presentationType={presentationType}
        onEdit={onEdit}
        compact={compact}
      />
    );
  }

  return (
    <DefaultLayoutCard game={game} resolved={resolved} onEdit={onEdit} compact={compact} />
  );
}
