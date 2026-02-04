import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { formatSecondsAsHhMmSs } from './formatSecondsAsHhMmSs';

/** Backend total; when active and session start known, add elapsed for live tick only. Resets on refetch. */
interface Props {
  totalPlaytimeSeconds: number;
  isTimeTrackingActive: boolean;
  currentSessionStartedAt?: string | null;
}

export default function PlaythroughTimeDisplay({
  totalPlaytimeSeconds,
  isTimeTrackingActive,
  currentSessionStartedAt,
}: Props) {
  const [displaySeconds, setDisplaySeconds] = useState(totalPlaytimeSeconds);

  useEffect(() => {
    setDisplaySeconds(totalPlaytimeSeconds);
  }, [totalPlaytimeSeconds]);

  useEffect(() => {
    if (!isTimeTrackingActive || !currentSessionStartedAt) return;
    const startMs = new Date(currentSessionStartedAt).getTime();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      setDisplaySeconds(totalPlaytimeSeconds + elapsed);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [
    isTimeTrackingActive,
    currentSessionStartedAt,
    totalPlaytimeSeconds,
  ]);

  return (
    <Typography variant="body2" component="span" fontFamily="monospace">
      {formatSecondsAsHhMmSs(displaySeconds)}
    </Typography>
  );
}
