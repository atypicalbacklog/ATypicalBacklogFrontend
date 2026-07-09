import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { compactBlurredFilterPanelSx } from '../yearlyReview/yearlyReviewPanelStyles';
import {
  useStatisticsFilters,
  STATS_MIN_YEAR,
  STATS_LAST_YEAR,
  STATS_CURRENT_YEAR,
} from './StatisticsFiltersContext';

const fromYearMax = Math.max(STATS_MIN_YEAR, STATS_LAST_YEAR);
const fromYearOptions = Array.from(
  { length: fromYearMax - STATS_MIN_YEAR + 1 },
  (_, i) => STATS_MIN_YEAR + i
);
const toYearOptions = Array.from(
  { length: STATS_CURRENT_YEAR - STATS_MIN_YEAR + 1 },
  (_, i) => STATS_MIN_YEAR + i
);

export default function StatisticsFilterBar() {
  const { fromYear, toYear, setFromYear, setToYear, yearRange } = useStatisticsFilters();

  return (
    <Box sx={{ ...compactBlurredFilterPanelSx, mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="center" gap={2} flexWrap="wrap">
        <Typography variant="subtitle1" color="text.secondary">
          Year range
        </Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="stats-from-year">From</InputLabel>
          <Select
            labelId="stats-from-year"
            label="From"
            value={fromYear}
            onChange={(e) => setFromYear(Number(e.target.value))}
          >
            {fromYearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="stats-to-year">To</InputLabel>
          <Select
            labelId="stats-to-year"
            label="To"
            value={toYear}
            onChange={(e) => setToYear(Number(e.target.value))}
          >
            {toYearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
          {yearRange.length} year{yearRange.length !== 1 ? 's' : ''} selected
        </Box>
      </Stack>
    </Box>
  );
}
