import type { IgdbGameSearchResultDto, IgdbReleaseDateDto } from '../../services/igdbApi';
import type { ConsoleDto, PlatformDto } from '../../types/referenceData';
import type { SimpleLookupDto } from '../../types/referenceData';

/** Normalize for matching: lowercase, collapse spaces. */
function norm(s: string): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Find console UID that best matches an IGDB platform abbreviation.
 * Compares abbreviation to console name and platform names (platforms under that console).
 */
function findConsoleUidByAbbreviation(
  abbreviation: string | null,
  consoles: ConsoleDto[],
  platforms: PlatformDto[]
): string | null {
  if (!abbreviation || !abbreviation.trim()) return null;
  const abbr = norm(abbreviation);
  if (!abbr) return null;

  // Direct match on console name
  for (const c of consoles) {
    if (norm(c.name) === abbr || norm(c.fullname ?? c.name) === abbr) return c.uid;
  }
  // Console name contains abbreviation or abbreviation contains console name (e.g. "ps5" vs "playstation 5")
  for (const c of consoles) {
    const cName = norm(c.name);
    const cFull = norm(c.fullname ?? c.name);
    if (cName.includes(abbr) || abbr.includes(cName)) return c.uid;
    if (cFull.includes(abbr) || abbr.includes(cFull)) return c.uid;
  }
  // Match via platform name (platform belongs to console)
  for (const p of platforms) {
    const pName = norm(p.name);
    if (pName === abbr || pName.includes(abbr) || abbr.includes(pName)) {
      const con = consoles.find((c) => c.uid === p.consoleUid);
      if (con) return con.uid;
    }
  }
  return null;
}

/** PC-like platforms: PC, Mac, Linux (all count as PC for Multiplatform detection). */
const PC_LIKE = ['pc', 'mac', 'linux'];

/** Check if an abbreviation represents PC-like (PC/Mac/Linux) or Mobile (for Multiplatform detection). */
function isPcOrMobile(abbreviation: string | null): boolean {
  if (!abbreviation) return false;
  const a = norm(abbreviation);
  if (a === 'mobile' || a.includes('mobile')) return true;
  return PC_LIKE.some((p) => a === p || a.includes(p));
}

/** Get variant UID by name (case-insensitive). */
function findVariantUidByName(name: string, variants: SimpleLookupDto[]): string | null {
  const n = norm(name);
  const v = variants.find((x) => norm(x.name) === n);
  return v?.uid ?? null;
}

/**
 * Count effective entries: PC/Mac/Linux count as 1 entry together.
 * Returns { effectiveCount, hasPcLike } where effectiveCount treats PC-like platforms as 1.
 */
function countEffectiveEntries(releaseDates: IgdbReleaseDateDto[]): {
  effectiveCount: number;
  hasPcLike: boolean;
} {
  let hasPcLike = false;
  let nonPcLikeCount = 0;

  for (const rd of releaseDates) {
    if (isPcOrMobile(rd.platformAbbreviation)) {
      hasPcLike = true;
    } else {
      nonPcLikeCount++;
    }
  }

  // PC-like platforms count as 1 entry total
  const effectiveCount = (hasPcLike ? 1 : 0) + nonPcLikeCount;
  return { effectiveCount, hasPcLike };
}

export interface ResolveVariantAndOriginalResult {
  variantUid: string | null;
  originalConsoleUid: string | null;
}

/**
 * Resolve variant and original platform from external game release dates and current platform.
 * Only sets values that are not already set (empty string / null).
 */
export function resolveVariantAndOriginalFromExternalGame(
  externalGame: IgdbGameSearchResultDto,
  currentPlatformUid: string,
  currentVariantUid: string,
  currentOriginalConsoleUid: string,
  consoles: ConsoleDto[],
  platforms: PlatformDto[],
  variants: SimpleLookupDto[]
): ResolveVariantAndOriginalResult {
  let variantUid: string | null = currentVariantUid || null;
  let originalConsoleUid: string | null = currentOriginalConsoleUid || null;

  const releaseDates = externalGame.releaseDates?.filter(
    (rd) => rd.platformAbbreviation != null && rd.platformAbbreviation.trim() !== ''
  );
  if (!releaseDates || releaseDates.length === 0) {
    return { variantUid, originalConsoleUid };
  }

  const sorted = [...releaseDates].sort((a, b) => {
    const da = a.date ?? '';
    const db = b.date ?? '';
    if (da && db) return da.localeCompare(db);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });

  // Group by date
  const byDate = new Map<string, IgdbReleaseDateDto[]>();
  for (const rd of sorted) {
    const d = rd.date ?? '';
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(rd);
  }
  const datesAsc = Array.from(byDate.keys()).filter(Boolean).sort();
  const firstDate = datesAsc[0] ?? '';

  // Original Platform: if exactly one effective platform across all release dates, set original to that console
  // (PC/Mac/Linux count as 1 platform)
  if (!originalConsoleUid) {
    const { effectiveCount } = countEffectiveEntries(sorted);
    if (effectiveCount === 1) {
      // Find the console UID - prefer non-PC-like if both exist, otherwise use first
      const nonPcLike = sorted.find((rd) => !isPcOrMobile(rd.platformAbbreviation));
      const target = nonPcLike ?? sorted[0];
      const cUid = findConsoleUidByAbbreviation(target.platformAbbreviation, consoles, platforms);
      if (cUid) originalConsoleUid = cUid;
    }
  }

  // Variant: need current platform's console name to compare with release date platforms
  if (!variantUid && currentPlatformUid) {
    const currentPlatform = platforms.find((p) => p.uid === currentPlatformUid);
    const currentConsole = currentPlatform
      ? consoles.find((c) => c.uid === currentPlatform.consoleUid)
      : null;
    const currentConsoleName = currentConsole ? norm(currentConsole.name) : '';

    const currentPlatformAbbreviationMatches = (rd: IgdbReleaseDateDto): boolean => {
      const abbr = rd.platformAbbreviation ? norm(rd.platformAbbreviation) : '';
      if (!abbr || !currentConsoleName) return false;
      if (abbr === currentConsoleName) return true;
      if (currentConsoleName.includes(abbr) || abbr.includes(currentConsoleName)) return true;
      const platformName = currentPlatform ? norm(currentPlatform.name) : '';
      if (platformName && (abbr === platformName || platformName.includes(abbr) || abbr.includes(platformName)))
        return true;
      return false;
    };

    const entriesForFirstDate = firstDate ? (byDate.get(firstDate) ?? []) : [];
    const currentFitsFirstRelease =
      firstDate &&
      entriesForFirstDate.some(currentPlatformAbbreviationMatches);
    const currentFitsLaterRelease =
      datesAsc.length > 1 &&
      datesAsc.slice(1).some((d) => (byDate.get(d) ?? []).some(currentPlatformAbbreviationMatches));

    if (currentFitsFirstRelease) {
      // Count effective entries: PC/Mac/Linux count as 1
      const { effectiveCount, hasPcLike } = countEffectiveEntries(entriesForFirstDate);
      if (effectiveCount === 1) {
        variantUid = findVariantUidByName('Original', variants);
      } else {
        // Multiple effective entries: Multiplatform if PC-like is present, else Console Exclusive
        variantUid = hasPcLike
          ? findVariantUidByName('Multiplatform', variants)
          : findVariantUidByName('Console Exclusive', variants);
      }
    } else if (currentFitsLaterRelease) {
      variantUid = findVariantUidByName('Port', variants);
    }
  }

  return { variantUid, originalConsoleUid };
}
