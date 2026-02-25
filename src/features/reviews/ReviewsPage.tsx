import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import YearlyReviewPage from '../yearlyReview/YearlyReviewPage';
import StatisticsDashboardPage from '../statistics/StatisticsDashboardPage';

export default function ReviewsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 2 }}
        aria-label="Reviews tabs"
      >
        <Tab label="Yearly review" />
        <Tab label="Statistics" />
      </Tabs>

      {tab === 0 && <YearlyReviewPage />}
      {tab === 1 && <StatisticsDashboardPage />}
    </Box>
  );
}

