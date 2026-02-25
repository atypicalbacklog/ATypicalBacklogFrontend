import { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { formatSecondsAsHhMm } from './formatSecondsAsHhMmSs';

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

function formatCurrentSession(seconds: number): string {
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

function formatTotalRunning(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: hours < 10 ? 1 : 0,
    maximumFractionDigits: hours < 10 ? 1 : 0,
  });
  return `${formatter.format(hours)}h`;
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
      const diffSeconds = Math.floor((Date.now() - startMs) / 1000);
      setCurrentSessionSeconds(diffSeconds > 0 ? diffSeconds : 0);
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
        {formatTotalRunning(totalPlaytimeSeconds)}
      </Typography>
      <Typography variant="body2" component="span" color="primary.main" fontFamily="monospace">
        +{formatCurrentSession(currentSessionSeconds)}
      </Typography>
    </Stack>
  );
}
