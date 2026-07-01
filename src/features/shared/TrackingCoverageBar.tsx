import { Box, Tooltip } from '@mui/material';

export interface TrackingCoverageBarProps {
  /** 0–100. Values ≤0 render as TODO (empty bar). */
  percent: number;
  size?: 'small' | 'medium';
}

/**
 * Horizontal coverage bar using the same visual language as CompletionBar.
 * Shows fill only; label text appears inside the bar when percent is 0 (TODO).
 */
export default function TrackingCoverageBar({ percent, size = 'medium' }: TrackingCoverageBarProps) {
  const isTodo = percent <= 0;
  const fillPercent = isTodo ? 0 : Math.min(100, Math.max(0, percent));
  const fillColor = fillPercent >= 100 ? '#eab308' : '#22c55e';

  const isSmall = size === 'small';
  const barHeight = isSmall ? 14 : 16;
  const barWidth = isSmall ? 72 : 96;
  const innerFontSize = isSmall ? '0.5625rem' : '0.625rem';

  const tooltipTitle = isTodo ? 'Not tracked yet' : `${fillPercent}% coverage`;

  return (
    <Tooltip title={tooltipTitle} enterDelay={300}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          width: barWidth,
        }}
      >
        <Box
          sx={{
            width: barWidth,
            height: barHeight,
            minHeight: barHeight,
            maxHeight: barHeight,
            boxSizing: 'border-box',
            borderRadius: 1,
            border: '2px solid',
            borderColor: '#9ca3af',
            overflow: 'hidden',
          }}
        >
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
                width: `${fillPercent}%`,
                bgcolor: fillColor,
                transition: 'width 0.2s ease-out',
              }}
            />
            {fillPercent >= 80 && fillPercent < 100 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${fillPercent}%`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  bgcolor: '#777',
                  transform: 'translateX(-0.5px)',
                }}
              />
            )}
            {isTodo && (
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
                  color: '#666',
                  textShadow: '0 0 1px #fff',
                  pointerEvents: 'none',
                }}
              >
                Todo
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
}
