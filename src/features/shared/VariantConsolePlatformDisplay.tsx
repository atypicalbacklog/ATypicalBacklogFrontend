import { Box, Typography } from '@mui/material';
import type { GameInstanceDTO } from '../../types/dto';
import type { ReferenceDataPayload } from '../../types/referenceData';

/**
 * Display props for non-editable variant/console/platform data.
 * Resolve names from reference data (platforms, consoles, variants) before passing.
 */
export interface VariantConsolePlatformDisplayProps {
  /** Variant display name (e.g. "Original", "Digital") */
  variantName: string;
  /** Platform display name */
  platformName: string;
  /** Name of the console this platform belongs to (used to decide "Console: Platform" vs "Platform") */
  platformConsoleName: string;
  /** Original console display name for "Orig:" part; omit or null to hide */
  originalConsoleName?: string | null;
  /** Typography variant for the main text */
  variant?: 'body1' | 'body2' | 'caption';
  /** Optional color (e.g. "text.secondary") */
  color?: string;
}

/**
 * Checks whether the platform name already contains the console name
 * (e.g. "Nintendo Switch" contains "Nintendo").
 */
function platformNameContainsConsole(platformName: string, consoleName: string): boolean {
  const c = (consoleName ?? '').trim();
  if (!c) return false;
  const p = (platformName ?? '').toLowerCase();
  return p.includes(c.toLowerCase());
}

/**
 * Displays variant, console/platform, and optional original console in a single line.
 * Used when showing non-editable game instance variant/console data.
 *
 * - Variant - Console: Platform | "Orig:" Original_console
 * If console name is already in platform name: Variant - Platform | "Orig:" Original_console
 * If variant is "Original": no "Orig:" part (Variant - Console: Platform or Variant - Platform).
 * The "Orig:" Original_console part is italicized.
 */
export default function VariantConsolePlatformDisplay({
  variantName,
  platformName,
  platformConsoleName,
  originalConsoleName,
  variant = 'body2',
  color,
}: VariantConsolePlatformDisplayProps) {
  const safeVariantName = variantName ?? '';
  const safePlatformName = platformName ?? '';
  const safePlatformConsoleName = platformConsoleName ?? '';
  const isOriginalVariant = safeVariantName.toLowerCase() === 'original';
  const showOrig = !isOriginalVariant && originalConsoleName != null && originalConsoleName !== '';
  const omitConsolePrefix =
    !safePlatformConsoleName.trim() ||
    platformNameContainsConsole(safePlatformName, safePlatformConsoleName);

  const mainPart =
    omitConsolePrefix
      ? `${safeVariantName} – ${safePlatformName}`
      : `${safeVariantName} – ${safePlatformConsoleName}: ${safePlatformName}`;

  return (
    <Box component="span" sx={{ color: color ?? undefined }}>
      <Typography component="span" variant={variant} sx={{ color: 'inherit' }}>
        {mainPart}
      </Typography>
      {showOrig && (
        <>
          <Typography component="span" variant={variant} sx={{ color: 'inherit', mx: 0.5 }}>
            {' | '}
          </Typography>
          <Typography
            component="span"
            variant={variant}
            sx={{ color: 'inherit', fontStyle: 'italic' }}
          >
            Orig: {originalConsoleName}
          </Typography>
        </>
      )}
    </Box>
  );
}

/**
 * Builds display props for VariantConsolePlatformDisplay from a game instance and reference data.
 * Use when you have the full instance and reference data loaded.
 */
export function getVariantConsolePlatformDisplayProps(
  instance: Pick<GameInstanceDTO, 'platformUid' | 'variantUid' | 'originalConsoleUid'>,
  referenceData: ReferenceDataPayload | null | undefined
): VariantConsolePlatformDisplayProps {
  const platforms = referenceData?.data?.platforms ?? [];
  const consoles = referenceData?.data?.consoles ?? [];
  const variants = referenceData?.data?.variants ?? [];

  const platform = platforms.find((p) => p.uid === instance.platformUid);
  const platformName = platform?.name ?? instance.platformUid ?? '';
  const platformConsoleName =
    platform != null
      ? (consoles.find((c) => c.uid === platform.consoleUid)?.name ?? '')
      : '';

  const variantName =
    variants.find((v) => v.uid === instance.variantUid)?.name ?? instance.variantUid ?? '';

  const originalConsoleName =
    instance.originalConsoleUid != null && instance.originalConsoleUid !== ''
      ? (consoles.find((c) => c.uid === instance.originalConsoleUid)?.fullname ??
         consoles.find((c) => c.uid === instance.originalConsoleUid)?.name ??
         instance.originalConsoleUid)
      : null;

  return {
    variantName,
    platformName,
    platformConsoleName,
    originalConsoleName,
  };
}
