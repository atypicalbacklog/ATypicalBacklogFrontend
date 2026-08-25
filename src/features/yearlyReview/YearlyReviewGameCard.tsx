import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import GameImageMissingPlaceholder from '../shared/GameImageMissingPlaceholder';
import { getImageUrl } from '../../services/imageApi';
import { getAdditionalImageUrl } from '../../services/additionalImageApi';
import { GameApi } from '../../services/gameApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import type { YearlyReviewGameDto } from '../../services/yearlyReviewApi';
import type { GameDTO, GameInstanceDetailDTO, YearlyReviewGamePresentationType } from '../../types/dto';
import {
  isSideImagePresentation,
  isTextOnlyYearlyReviewGame,
  normalizeYearlyReviewGamePresentationType,
  yearlyReviewSideCardWidth,
  yearlyReviewSideImageHeight,
  yearlyReviewSideImageMaxWidth,
  yearlyReviewSideImageWidth,
  yearlyReviewSideLayoutInitialFontSize,
  yearlyReviewSideUsesLargeImage,
  YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS,
  YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS_COMPACT,
  YEARLY_REVIEW_SIDE_TEXT_OVERFLOW_TOLERANCE_PX,
} from './yearlyReviewGamePresentationUtils';
import TextOnlyYearlyReviewCard from './TextOnlyYearlyReviewCard';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 330;
const CARD_WIDTH_COMPACT = 100;
const CARD_HEIGHT_COMPACT = 180;
const TEXT_FONT_SIZE_DEFAULT = '1.0rem';
const TEXT_FONT_SIZE_SMALL = '0.85rem';
const TEXT_FONT_SIZE_MIN = '0.75rem';
/** Extra step on compact cards so long text can shrink before the image is crushed. */
const TEXT_FONT_SIZE_COMPACT_MIN = '0.65rem';
const TEXT_FONT_SIZE_STEPS = [
  TEXT_FONT_SIZE_DEFAULT,
  TEXT_FONT_SIZE_SMALL,
  TEXT_FONT_SIZE_MIN,
] as const;
const TEXT_FONT_SIZE_STEPS_COMPACT = [
  TEXT_FONT_SIZE_DEFAULT,
  TEXT_FONT_SIZE_SMALL,
  TEXT_FONT_SIZE_MIN,
  TEXT_FONT_SIZE_COMPACT_MIN,
] as const;

const DEFAULT_IMAGE_HEIGHT = CARD_HEIGHT - 40;
const MIN_IMAGE_HEIGHT = 80;
const DEFAULT_IMAGE_HEIGHT_COMPACT = CARD_HEIGHT_COMPACT - 32;
/** Keep covers readable on mobile; leftover text scrolls. */
const MIN_IMAGE_HEIGHT_COMPACT = 72;
const IMAGE_SHRINK_STEP_PX = 20;

function nextDefaultTextFontSize(
  current: string,
  compact: boolean
): string {
  const steps = compact ? TEXT_FONT_SIZE_STEPS_COMPACT : TEXT_FONT_SIZE_STEPS;
  const idx = (steps as readonly string[]).indexOf(current);
  if (idx < 0) return steps[1] ?? steps[0];
  return steps[Math.min(idx + 1, steps.length - 1)];
}

function isDefaultTextFontAtMin(current: string, compact: boolean): boolean {
  const steps = compact ? TEXT_FONT_SIZE_STEPS_COMPACT : TEXT_FONT_SIZE_STEPS;
  return current === steps[steps.length - 1];
}

interface Props {
  game: YearlyReviewGameDto;
  onEdit?: () => void;
  /** When true, use smaller card size (e.g. smartphone); font size unchanged, padding can be 0. */
  compact?: boolean;
}

interface ResolvedData {
  displayName: string;
  coverImageUid: string | null;
  imageKind: 'game' | 'additional';
}

function resolveCoverUrl(
  coverUid: string | null,
  imageKind: 'game' | 'additional'
): string | null {
  return imageKind === 'additional'
    ? getAdditionalImageUrl(coverUid, true)
    : getImageUrl(coverUid, true);
}

function useResolvedGame(game: YearlyReviewGameDto): ResolvedData | null {
  const [resolved, setResolved] = useState<ResolvedData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResolved(null);

    const set = (data: ResolvedData) => {
      if (!cancelled) setResolved(data);
    };

    if (game.additionalImageUid) {
      set({
        displayName: 'Custom image',
        coverImageUid: game.additionalImageUid,
        imageKind: 'additional',
      });
      return () => {
        cancelled = true;
      };
    }

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

          set({ displayName, coverImageUid: cover, imageKind: 'game' });
        } catch {
          set({ displayName: 'Game', coverImageUid: imageUid, imageKind: 'game' });
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
            imageKind: 'game',
          })
        )
        .catch(() =>
          set({ displayName: 'Game', coverImageUid: imageUid, imageKind: 'game' })
        );
      return () => {
        cancelled = true;
      };
    }

    set({ displayName: '—', coverImageUid: imageUid, imageKind: 'game' });
    return () => {
      cancelled = true;
    };
  }, [game.gameUid, game.gameInstanceUid, game.preferredImageUid, game.additionalImageUid]);

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
  const imageKind = resolved?.imageKind ?? 'game';
  const coverUid =
    game.additionalImageUid ?? game.preferredImageUid ?? resolved?.coverImageUid ?? null;
  const imageUrl = resolveCoverUrl(coverUid, game.additionalImageUid ? 'additional' : imageKind);
  const cardWidth = yearlyReviewSideCardWidth(game.text, compact);
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT;
  const usesLargeImage = yearlyReviewSideUsesLargeImage(game.text);
  const maxImageWidth = yearlyReviewSideImageMaxWidth(game.text, compact);
  const fixedImageWidth = yearlyReviewSideImageWidth(compact);
  const fixedImageHeight = yearlyReviewSideImageHeight(compact);
  const maxImageHeight = cardHeight - (compact ? 8 : 16);
  const fontSteps = compact
    ? YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS_COMPACT
    : YEARLY_REVIEW_SIDE_TEXT_FONT_STEPS;
  const imageOnLeft = presentationType === 'IMAGE_LEFT';

  const sideImageRef = useRef<HTMLImageElement | null>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [scaledImageHeight, setScaledImageHeight] = useState<number>(fixedImageHeight);
  const [textFontSize, setTextFontSize] = useState(() =>
    yearlyReviewSideLayoutInitialFontSize(compact)
  );

  const imageBlockWidth = usesLargeImage ? maxImageWidth : fixedImageWidth;
  const imageBlockHeight = usesLargeImage ? scaledImageHeight : fixedImageHeight;

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
    setTextFontSize(yearlyReviewSideLayoutInitialFontSize(compact));
  }, [game.uid, game.text, imageUrl, usesLargeImage, fixedImageHeight, cardWidth, compact]);

  // Step font down only when text overflows available container height (desktop).
  useEffect(() => {
    if (compact || !game.text || !textRef.current || !textContainerRef.current) return;
    let cancelled = false;
    let frame = 0;

    const measure = () => {
      if (cancelled || !textRef.current || !textContainerRef.current) return;
      const textEl = textRef.current;
      const container = textContainerRef.current;
      if (container.clientHeight <= 0) return;

      const styles = getComputedStyle(container);
      const padY =
        (Number.parseFloat(styles.paddingTop) || 0) +
        (Number.parseFloat(styles.paddingBottom) || 0);
      const available = container.clientHeight - padY;
      if (available <= 0) return;

      // Unconstrain briefly so scrollHeight reflects full wrapped height.
      const prevMax = textEl.style.maxHeight;
      textEl.style.maxHeight = 'none';
      const needed = textEl.scrollHeight;
      textEl.style.maxHeight = prevMax;

      if (needed <= available + YEARLY_REVIEW_SIDE_TEXT_OVERFLOW_TOLERANCE_PX) return;

      setTextFontSize((prev) => {
        const steps = fontSteps as readonly string[];
        const idx = steps.indexOf(prev);
        const nextIdx = idx < 0 ? 1 : idx + 1;
        if (nextIdx >= steps.length) return prev;
        return steps[nextIdx];
      });
    };

    frame = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [game.text, game.uid, textFontSize, cardWidth, imageBlockWidth, imageBlockHeight, compact, fontSteps]);

  useEffect(() => {
    if (compact || !game.text || !textContainerRef.current) return;
    const container = textContainerRef.current;
    const observer = new ResizeObserver(() => {
      setTextFontSize(yearlyReviewSideLayoutInitialFontSize(compact));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [game.text, compact, cardWidth]);

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
      ref={textContainerRef}
      sx={{
        flex: compact ? '0 1 auto' : '1 1 0',
        minWidth: 0,
        height: compact ? 'auto' : '100%',
        display: 'flex',
        alignItems: compact ? 'flex-start' : 'center',
        px: compact ? 0.75 : 1.25,
        py: compact ? 0.5 : 0.75,
        overflow: compact ? 'auto' : 'hidden',
        ...(compact ? { maxHeight: 240 } : {}),
      }}
    >
      <Typography
        ref={textRef}
        color="text.secondary"
        sx={{
          width: '100%',
          maxHeight: compact ? 'none' : '100%',
          fontSize: textFontSize,
          lineHeight: 1.4,
          overflow: compact ? 'visible' : 'hidden',
          textAlign: 'left',
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
  const imageKind = resolved?.imageKind ?? 'game';
  const coverUid =
    game.additionalImageUid ?? game.preferredImageUid ?? resolved?.coverImageUid ?? null;
  const imageUrl = resolveCoverUrl(coverUid, game.additionalImageUid ? 'additional' : imageKind);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [baseImageHeight, setBaseImageHeight] = useState<number>(defaultImageHeight);
  const [imageHeight, setImageHeight] = useState<number>(defaultImageHeight);
  const [textFontSize, setTextFontSize] = useState(TEXT_FONT_SIZE_DEFAULT);
  const textRef = useRef<HTMLParagraphElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
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

  const textOverflows = () => {
    const container = textContainerRef.current;
    if (!container || container.clientHeight <= 0) return false;
    return container.scrollHeight > container.clientHeight + 1;
  };

  // Measure after layout + image area updates; double rAF avoids stale clientHeight on first paint.
  useEffect(() => {
    if (!game.text) return;
    let cancelled = false;
    let frame = 0;

    const measure = () => {
      if (cancelled || !textOverflows()) return;
      if (isDefaultTextFontAtMin(textFontSize, compact)) return;
      setTextFontSize((prev) => nextDefaultTextFontSize(prev, compact));
    };

    frame = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [game.text, game.uid, imageHeight, textFontSize, compact]);

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
    if (!game.text) return;
    let cancelled = false;
    let frame = 0;

    const measure = () => {
      if (cancelled || !textOverflows()) return;
      if (!isDefaultTextFontAtMin(textFontSize, compact)) return;
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
  }, [game.text, game.uid, textFontSize, imageHeight, minImageHeight, compact]);

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
          ref={textContainerRef}
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            alignItems: compact ? 'flex-start' : 'center',
            justifyContent: 'center',
            overflow: compact ? 'auto' : 'hidden',
            px: compact ? 0 : 0.25,
            py: compact ? 0 : 0.25,
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={(e) => {
            if (
              compact &&
              e.currentTarget.scrollHeight > e.currentTarget.clientHeight
            ) {
              e.stopPropagation();
            }
          }}
        >
          <Typography
            ref={textRef}
            color="text.secondary"
            sx={{
              width: '100%',
              fontSize: textFontSize,
              lineHeight: 1.35,
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
  const textOnly = isTextOnlyYearlyReviewGame(game);
  const resolved = useResolvedGame(game);
  const presentationType = normalizeYearlyReviewGamePresentationType(game.presentationType);

  if (textOnly) {
    return <TextOnlyYearlyReviewCard game={game} onEdit={onEdit} compact={compact} />;
  }

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
