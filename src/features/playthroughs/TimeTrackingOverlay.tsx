import { Box } from '@mui/material';

interface Props {
  isTimeTrackingActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function TimeTrackingOverlay({
  isTimeTrackingActive,
  onClick,
  disabled = false,
}: Props) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.4)',
        borderRadius: 1,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        '&:hover': disabled ? {} : { bgcolor: 'rgba(0,0,0,0.5)' },
      }}
      role="button"
      aria-label={isTimeTrackingActive ? 'Pause time tracking' : 'Start time tracking'}
    >
      <Box
        component="span"
        sx={{
          color: 'white',
          fontSize: 48,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {isTimeTrackingActive ? '❚❚' : '▶'}
      </Box>
    </Box>
  );
}
