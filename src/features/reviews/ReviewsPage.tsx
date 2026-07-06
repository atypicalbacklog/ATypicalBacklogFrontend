import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import YearlyReviewPage from '../yearlyReview/YearlyReviewPage';
import StatisticsDashboardPage from '../statistics/StatisticsDashboardPage';

export default function ReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(0);

  const handleTabChange = (_: unknown, value: number) => {
    setTab(value);
    if (value === 1 && searchParams.has('year')) {
      const next = new URLSearchParams(searchParams);
      next.delete('year');
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
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
