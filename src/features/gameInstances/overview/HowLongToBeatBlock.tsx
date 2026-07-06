import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { HltbEstimateDto, UpsertHltbEstimateRequest } from '../../../services/hltbApi';
import { HltbApi } from '../../../services/hltbApi';

const HLTB_BASE = 'https://howlongtobeat.com/?q=';

function buildHltbUrl(query: string): string {
  return `${HLTB_BASE}${encodeURIComponent(query)}`;
}

function formatHours(h: number): string {
  if (h === 0) return '0 H';
  if (h < 1) return `${Math.round(h * 60)}m`;
  const whole = Math.floor(h);
  const frac = h - whole;
  if (frac >= 0.45 && frac <= 0.55) return `${whole}½ H`;
  const formatted = h.toFixed(1);
  const withoutTrailingZero = formatted.endsWith('.0') ? String(whole) : formatted;
  return `${withoutTrailingZero} H`;
}

const TimeRow = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    }}
  >
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 0.5,
        width: 100,
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

interface Props {
  gameInstanceUid: string;
  gameName: string;
  instanceName?: string | null;
  estimate: HltbEstimateDto | null;
  onSaved: () => void;
  readOnly?: boolean;
}

export default function HowLongToBeatBlock({
  gameInstanceUid,
  gameName,
  instanceName,
  estimate,
  onSaved,
  readOnly = false,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [mainHours, setMainHours] = useState('');
  const [extraHours, setExtraHours] = useState('');
  const [completeHours, setCompleteHours] = useState('');
  const [externalId, setExternalId] = useState('');
  const [saving, setSaving] = useState(false);

  const game = gameName?.trim() || '';
  const instance = instanceName?.trim() || '';
  const showBothLinks = instance !== '' && instance !== game;

  const hasEstimate =
    estimate &&
    (estimate.mainHours > 0 || estimate.extraHours > 0 || estimate.completeHours > 0);

  const openEdit = () => {
    setMainHours(estimate?.mainHours != null ? String(estimate.mainHours) : '');
    setExtraHours(estimate?.extraHours != null ? String(estimate.extraHours) : '');
    setCompleteHours(estimate?.completeHours != null ? String(estimate.completeHours) : '');
    setExternalId(estimate?.externalId ?? '');
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: UpsertHltbEstimateRequest = {
        uid: estimate?.uid ?? null,
        gameInstanceUid,
        mainHours: parseFloat(mainHours) || 0,
        extraHours: parseFloat(extraHours) || 0,
        completeHours: parseFloat(completeHours) || 0,
        externalId: externalId.trim() || null,
      };
      await HltbApi.upsert(data);
      setEditOpen(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {hasEstimate && (
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <TimeRow value={formatHours(estimate!.mainHours)} label="Main" />
          <TimeRow value={formatHours(estimate!.extraHours)} label="Extra" />
          <TimeRow value={formatHours(estimate!.completeHours)} label="Complete" />
        </Stack>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mt: 'auto',
        }}
      >
        <Stack spacing={0.5} direction="row" flexWrap="wrap" useFlexGap>
          {game && (
            <Link
              href={buildHltbUrl(game)}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              variant="body2"
              color="primary"
            >
              {game}
            </Link>
          )}
          {showBothLinks && (
            <Link
              href={buildHltbUrl(instance)}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              variant="body2"
              color="primary"
            >
              {instance}
            </Link>
          )}
        </Stack>
        {!readOnly ? (
          <IconButton
            size="small"
            onClick={openEdit}
            aria-label="Edit HLTB estimate"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Dialog open={editOpen} onClose={() => !saving && setEditOpen(false)}>
        <DialogTitle>Edit HLTB estimate</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 280 }}>
            <TextField
              label="Main (hours)"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              value={mainHours}
              onChange={(e) => setMainHours(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Extra (hours)"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              value={extraHours}
              onChange={(e) => setExtraHours(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Complete (hours)"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              value={completeHours}
              onChange={(e) => setCompleteHours(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="External ID"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              size="small"
              fullWidth
              placeholder="Optional HLTB game ID"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
