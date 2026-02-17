import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import { formatPlaytime } from '../../library/formatPlaytime';
import DateWithIcon from '../../shared/DateWithIcon';
import PlaythroughTypeWithIcon from '../../shared/PlaythroughTypeWithIcon';

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <PlaythroughTypeWithIcon typeName={typeName} size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {stateName}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Input: {inputName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 0.5 }}>
          <DateWithIcon date={startedAt} tooltip="Started" variant="body2" />
          <Typography variant="body2" component="span">
            {formatPlaytime(totalSeconds)}
          </Typography>
        </Box>
        {dlcName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            DLC: {dlcName}
          </Typography>
        )}
        <Tooltip title="Edit Playthrough">
          <IconButton
            component={Link}
            to={`/playthroughs/${playthroughUid}`}
            size="small"
            aria-label="Edit Playthrough"
            sx={{ mt: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
