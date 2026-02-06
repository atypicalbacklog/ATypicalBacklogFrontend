import { Box, Typography } from '@mui/material';

export default function ReviewsPlaceholder() {
  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Reviews of instance
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Placeholder
      </Typography>
    </Box>
  );
}
