import { keyframes } from '@emotion/react';
import { Box, Tooltip } from '@mui/material';

export interface CompletionBarProps {
  /** Already-resolved completion state name (e.g. "Backlog", "Completed"). None = don't render. */
  completionState: string;
  /** Already-resolved playthrough state name or null. Affects border only. */
  playthroughState: string | null;
  /** Visual size variant; default is medium (original size). */
  size?: 'small' | 'medium';
}

const hueRotateBorder = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

const borderPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const NONE_VALUES = ['none', ''];
const FILL_CONFIG: Record<
  string,
  { fillPercent: number; fillColor: string; innerText?: string; endLine?: boolean; icon?: 'check' | 'trophy' }
> = {
  backlog: { fillPercent: 0, fillColor: 'transparent', innerText: 'Todo' },
  cancelled: { fillPercent: 0, fillColor: 'transparent', innerText: 'Removed' },
  started: { fillPercent: 10, fillColor: '#22c55e' },
  'in progress': { fillPercent: 50, fillColor: '#22c55e' },
  abandoned: { fillPercent: 50, fillColor: '#ef4444' },
  postponed: { fillPercent: 100 / 3, fillColor: '#4b5563', innerText: 'Todo' },
  finished: { fillPercent: 80, fillColor: '#22c55e', endLine: true, icon: 'check' },
  finishedplus: { fillPercent: 90, fillColor: '#22c55e', endLine: true, icon: 'check' },
  'finished plus': { fillPercent: 90, fillColor: '#22c55e', endLine: true, icon: 'check' },
  completed: { fillPercent: 100, fillColor: '#eab308', innerText: 'Completed', icon: 'trophy' },
};

const PLAYTHROUGH_BORDER: Record<string, 'active' | 'inactive' | 'finished' | 'abandoned'> = {
  active: 'active',
  inactive: 'inactive',
  finished: 'finished',
  abandoned: 'abandoned',
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function CompletionBar({
  completionState,
  playthroughState,
  size = 'medium',
}: CompletionBarProps) {
  const key = normalize(completionState);
  if (NONE_VALUES.includes(key) || key === '') return null;

  const config = FILL_CONFIG[key] ?? FILL_CONFIG.backlog;
  const borderKind = playthroughState ? PLAYTHROUGH_BORDER[normalize(playthroughState)] : undefined;
  const tooltipTitle = playthroughState
    ? `${completionState} | ${playthroughState}`
    : completionState;

  const isSmall = size === 'small';
  const barHeight = isSmall ? 16 : 20;
  const barMinWidth = isSmall ? 96 : 132;
  const containerMinWidth = isSmall ? 96 : 120;
  const containerMaxWidth = isSmall ? 200 : 240;
  const innerFontSize = isSmall ? '0.625rem' : '0.6875rem';
  const iconFontSize = isSmall ? '0.875rem' : '1rem';

  const innerBar = (
    <Box
      sx={{
        height: '100%',
        borderRadius: 0.75,
        bgcolor: '#b1bac4',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${config.fillPercent}%`,
          bgcolor: config.fillColor,
          transition: 'width 0.2s ease-out',
        }}
      />
      {config.endLine && config.fillPercent > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: `${config.fillPercent}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            bgcolor: '#777',
            transform: 'translateX(-0.5px)',
          }}
        />
      )}
      {config.innerText && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: innerFontSize,
            fontWeight: 700,
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
            color: key === 'completed' ? 'rgba(0,0,0,0.55)' : '#666',
            textShadow: '0 0 1px #fff',
            pointerEvents: 'none',
          }}
        >
          {config.innerText}
        </Box>
      )}
    </Box>
  );

  const barWithBorder =
    borderKind === 'active' ? (
      <Box
        sx={{
          flex: 1,
          minWidth: barMinWidth,
          height: barHeight,
          minHeight: barHeight,
          maxHeight: barHeight,
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 1,
            background:
              'conic-gradient(from 0deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)',
            animation: `${hueRotateBorder} 8s linear infinite`,
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, margin: '2px', height: 'calc(100% - 4px)' }}>
          {innerBar}
        </Box>
      </Box>
    ) : (
      <Box
        sx={{
          flex: 1,
          minWidth: barMinWidth,
          height: barHeight,
          minHeight: barHeight,
          maxHeight: barHeight,
          boxSizing: 'border-box',
          borderRadius: 1,
          border: '2px solid',
          borderColor:
            borderKind === 'finished'
              ? '#4ade80'
              : borderKind === 'abandoned'
                ? '#f87171'
                : borderKind === 'inactive'
                  ? '#6b7280'
                  : '#9ca3af',
          overflow: 'hidden',
          animation: borderKind === 'inactive' ? `${borderPulse} 2s ease-in-out infinite` : undefined,
        }}
      >
        {innerBar}
      </Box>
    );

  return (
    <Tooltip title={tooltipTitle} enterDelay={300}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          minWidth: containerMinWidth,
          maxWidth: containerMaxWidth,
        }}
      >
        {barWithBorder}
        {config.icon === 'check' && (
          <Box
            component="span"
            sx={{ color: '#22c55e', fontSize: iconFontSize, lineHeight: 1 }}
            aria-hidden
          >
            ✓
          </Box>
        )}
        {config.icon === 'trophy' && (
          <Box component="span" sx={{ fontSize: iconFontSize, lineHeight: 1 }} aria-hidden>
            🏆
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
