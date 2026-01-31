import { Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <>
      <Typography variant="h4">Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Welcome to Atypical Backlog. Use the navigation to open games or game instances.
      </Typography>
    </>
  );
}
