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
        opacity: locked ? 0.6 : 1,
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
