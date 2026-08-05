import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const DEFAULT_CLOSE_DELAY_MS = 1500;

type FeedTooltipContextValue = {
  activeId: string | null;
  open: (id: string) => void;
  scheduleClose: (delayMs?: number) => void;
  closeAll: () => void;
};

const FeedTooltipContext = createContext<FeedTooltipContextValue | null>(null);

export function FeedTooltipProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeAll = useCallback(() => {
    cancelClose();
    setActiveId(null);
  }, [cancelClose]);

  const open = useCallback(
    (id: string) => {
      cancelClose();
      setActiveId(id);
    },
    [cancelClose]
  );

  const scheduleClose = useCallback(
    (delayMs = DEFAULT_CLOSE_DELAY_MS) => {
      cancelClose();
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setActiveId(null);
      }, delayMs);
    },
    [cancelClose]
  );

  const value = useMemo(
    () => ({ activeId, open, scheduleClose, closeAll }),
    [activeId, open, scheduleClose, closeAll]
  );

  return (
    <FeedTooltipContext.Provider value={value}>{children}</FeedTooltipContext.Provider>
  );
}

export function useFeedTooltipOptional() {
  return useContext(FeedTooltipContext);
}
