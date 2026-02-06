import { Box, Typography } from '@mui/material';

export default function HowLongToBeatPlaceholder() {
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
      <Typography variant="body2" color="text.secondary">
        HowLongToBeat — placeholder
      </Typography>
    </Box>
  );
}
