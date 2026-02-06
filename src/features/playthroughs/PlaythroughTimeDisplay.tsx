import { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { formatSecondsAsHhMm, formatSecondsAsHhMmSs } from './formatSecondsAsHhMmSs';

/**
 * Parse ISO instant to UTC milliseconds. Uses Date.UTC() for Z-suffix so the value
 * is interpreted as UTC; for other offsets uses new Date(s).getTime().
 * Handles fractional seconds (keeps first 3 digits as milliseconds).
 */
function parseIsoToUtcMs(isoInstant: string): number {
  const s = isoInstant.trim();
  if (!s.endsWith('Z')) return new Date(s).getTime();
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3})\d*)?Z$/
  );
  if (!m) return new Date(s).getTime();
  const [, y, mo, d, h, min, sec, frac] = m;
  const ms = frac ? Number(frac.padEnd(3, '0').slice(0, 3)) : 0;
  return Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(min),
    Number(sec),
    ms
  );
}

/** When not running: total as hours+minutes. When running: left = total (no current session), right = elapsed since activeSessionStartedAt. */
interface Props {
  totalPlaytimeSeconds: number;
  isTimeTrackingActive: boolean;
  activeSessionStartedAt?: string | null;
}

export default function PlaythroughTimeDisplay({
  totalPlaytimeSeconds,
  isTimeTrackingActive,
  activeSessionStartedAt,
}: Props) {
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

  useEffect(() => {
    if (!isTimeTrackingActive || !activeSessionStartedAt) {
      setCurrentSessionSeconds(0);
      return;
    }
    const startMs = parseIsoToUtcMs(activeSessionStartedAt);
    const tick = () => {
      setCurrentSessionSeconds(Math.floor((Date.now() - startMs) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isTimeTrackingActive, activeSessionStartedAt]);

  if (!isTimeTrackingActive) {
    return (
      <Typography variant="body2" component="span" fontFamily="monospace">
        {formatSecondsAsHhMm(totalPlaytimeSeconds)}
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography variant="body2" component="span" fontFamily="monospace">
        {formatSecondsAsHhMm(totalPlaytimeSeconds)}
      </Typography>
      <Typography variant="body2" component="span" color="primary.main" fontFamily="monospace">
        +{formatSecondsAsHhMmSs(currentSessionSeconds)}
      </Typography>
    </Stack>
  );
}
