import { useCallback, useState } from 'react';
import { isPublicMode } from '../../app/AppConfig';

const STORAGE_KEY = 'library.groupedCards';

function readGroupedCardsEnabled(): boolean {
  if (typeof window === 'undefined') return isPublicMode();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return isPublicMode();
}

/** Preview toggle for grouped public-style library cards (defaults on in public mode). */
export function useGroupedLibraryCards(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(readGroupedCardsEnabled);

  const setGroupedCardsEnabled = useCallback((next: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(next));
    setEnabled(next);
  }, []);

  return [enabled, setGroupedCardsEnabled];
}
