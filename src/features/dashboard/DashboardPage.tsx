import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <>
      <Typography variant="h4">Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Welcome to Atypical Backlog. Use the navigation to open games or game instances.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 3 }}>
        <Button component={Link} to="/reviews/yearly" variant="outlined" size="medium">
          Yearly review
        </Button>
      </Stack>
    </>
  );
}
