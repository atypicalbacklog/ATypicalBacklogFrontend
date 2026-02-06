import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatPlaytime } from '../../library/formatPlaytime';

interface Props {
  playthroughUid: string;
  typeName: string;
  stateName: string;
  startedAt: string;
  inputName: string;
  totalSeconds: number;
  dlcName: string | null;
}

export default function PlaythroughOverviewCard({
  playthroughUid,
  typeName,
  stateName,
  startedAt,
  inputName,
  totalSeconds,
  dlcName,
}: Props) {
  const [graphOpen, setGraphOpen] = useState(false);

  return (
    <Card variant="outlined" sx={{ minWidth: 200, flexShrink: 0 }}>
      <CardContent>
        <Typography variant="body2" fontWeight="medium">
          {typeName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {stateName}
        </Typography>
        <Typography variant="body2">Started: {startedAt}</Typography>
        <Typography variant="body2">Input: {inputName}</Typography>
        <Typography variant="body2">
          Time: {formatPlaytime(totalSeconds)}
        </Typography>
        {dlcName && (
          <Typography variant="body2" color="text.secondary">
            DLC: {dlcName}
          </Typography>
        )}
        <Typography
          component={Link}
          to={`/playthroughs/${playthroughUid}`}
          variant="body2"
          sx={{ display: 'block', mt: 1 }}
        >
          Edit
        </Typography>
        <Typography
          component="button"
          variant="caption"
          onClick={() => setGraphOpen((o) => !o)}
          sx={{
            mt: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {graphOpen ? '▲' : '▼'} Graph (placeholder)
        </Typography>
        <Collapse in={graphOpen}>
          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Time bookings graph — placeholder
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
