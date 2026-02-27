import { Box } from '@mui/material';

interface Props {
  title?: string;
  locked?: boolean;
  children: React.ReactNode;
}

export default function StepSection({
  title,
  locked = false,
  children,
}: Props) {
  return (
    <Box
      sx={(theme) => ({
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        mb: 2,
        bgcolor:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        opacity: locked ? 0.3 : 1,
        pointerEvents: locked ? 'none' : 'auto',
      })}
    >
      {children}
    </Box>
  );
}