import { Box, Button } from '@mui/material';

interface Props {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export default function YearlyReviewYearSelector({ years, selectedYear, onYearChange }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1,
        mb: 2,
      }}
    >
      {years.map((y) => (
        <Button
          key={y}
          size="small"
          variant={y === selectedYear ? 'contained' : 'outlined'}
          onClick={() => onYearChange(y)}
        >
          {y}
        </Button>
      ))}
    </Box>
  );
}
