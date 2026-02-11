import { Box, Typography } from '@mui/material';

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
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        mb: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(4px)',
        opacity: locked ? 0.3 : 1,
        pointerEvents: locked ? 'none' : 'auto',
      }}
    >
      {title && (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}
