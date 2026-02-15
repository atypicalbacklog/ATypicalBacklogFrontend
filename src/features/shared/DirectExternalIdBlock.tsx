import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CallToActionIcon from '@mui/icons-material/CallToAction';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ImageIcon from '@mui/icons-material/Image';
import { IgdbApi, type IgdbGameSearchResultDto } from '../../services/igdbApi';

export interface DirectExternalIdActions {
  name: boolean;
  date: boolean;
  image: boolean;
}

interface Props {
  /** Called when user confirms with checkmark. Apply name/date/cover from result and actions. */
  onConfirm: (result: IgdbGameSearchResultDto, actions: DirectExternalIdActions) => void;
}

export default function DirectExternalIdBlock({ onConfirm }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<IgdbGameSearchResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>(['name']);

  const load = async () => {
    const id = value.trim();
    const num = parseInt(id, 10);
    if (!id || Number.isNaN(num)) {
      setError('Enter a valid numeric IGDB ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await IgdbApi.getByExternalId(num);
      setResult(data);
      const actions: string[] = ['name'];
      if (data.releaseDate) actions.push('date');
      if (data.coverImageUrl) actions.push('image');
      if (actions.length === 3) actions.push('all');
      setSelectedActions(actions);
    } catch {
      setError('Failed to load game');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (action: string) => {
    setSelectedActions((prev) => {
      const isSelected = prev.includes(action);
      if (action === 'all') {
        if (isSelected) return [];
        return ['name', 'date', 'image', 'all'];
      }
      if (isSelected) {
        return prev.filter((a) => a !== action && a !== 'all');
      }
      const next = [...prev.filter((a) => a !== 'all'), action];
      if (['name', 'date', 'image'].every((a) => a === action || next.includes(a))) next.push('all');
      return next;
    });
  };

  const handleConfirm = () => {
    if (!result) return;
    onConfirm(result, {
      name: selectedActions.includes('name') || selectedActions.includes('all'),
      date: selectedActions.includes('date') || selectedActions.includes('all'),
      image: selectedActions.includes('image') || selectedActions.includes('all'),
    });
    setResult(null);
    setShowInput(false);
    setValue('');
    setError(null);
  };

  const handleAbort = () => {
    setResult(null);
    setShowInput(false);
    setValue('');
    setError(null);
  };

  if (!showInput && !result) {
    return (
      <Button size="small" variant="outlined" onClick={() => setShowInput(true)}>
        Set external ID directly
      </Button>
    );
  }

  if (showInput && !result) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <TextField
          label="IGDB game ID"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          size="small"
          type="number"
          placeholder="e.g. 12345"
          sx={{ width: 140 }}
          error={!!error}
          helperText={error}
        />
        <Button size="small" variant="outlined" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Load'}
        </Button>
        <Button size="small" onClick={handleAbort}>
          Cancel
        </Button>
      </Stack>
    );
  }

  if (!result) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="stretch" sx={{ mt: 0.5 }}>
      <Card variant="outlined" sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: 360 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {result.coverImageUrl ? (
              <Box
                component="img"
                src={result.coverImageUrl}
                alt=""
                sx={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }}
              />
            ) : (
              <Box sx={{ width: 40, height: 56, bgcolor: 'action.hover', borderRadius: 0.5, flexShrink: 0 }} />
            )}
            <Stack flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight="medium">
                {result.name}
              </Typography>
              {result.releaseDate && (
                <Typography variant="caption" color="text.secondary">
                  {result.releaseDate}
                  {result.category ? ` · ${result.category}` : ''}
                </Typography>
              )}
              {result.releaseDates && result.releaseDates.length > 0 && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {result.releaseDates
                    .filter((rd) => rd.platformAbbreviation?.trim())
                    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
                    .map((rd) => (rd.date ? `${rd.platformAbbreviation} (${rd.date})` : rd.platformAbbreviation))
                    .slice(0, 4)
                    .join(', ')}
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            width: 128,
          }}
        >
          <ToggleButton
            value="name"
            selected={selectedActions.includes('name')}
            onClick={() => toggleAction('name')}
            aria-label="Set name"
            color="primary"
            sx={{ width: 64, height: 48, p: 0, borderRight: 1, borderBottom: 1, borderColor: 'divider' }}
          >
            <CallToActionIcon />
          </ToggleButton>
          <ToggleButton
            value="date"
            selected={selectedActions.includes('date')}
            onClick={() => toggleAction('date')}
            disabled={!result.releaseDate}
            aria-label="Set date"
            color="primary"
            sx={{ width: 64, height: 48, p: 0, borderBottom: 1, borderColor: 'divider' }}
          >
            <CalendarMonthIcon />
          </ToggleButton>
          <ToggleButton
            value="image"
            selected={selectedActions.includes('image')}
            onClick={() => toggleAction('image')}
            disabled={!result.coverImageUrl}
            aria-label="Set image"
            color="primary"
            sx={{ width: 64, height: 48, p: 0, borderRight: 1, borderColor: 'divider' }}
          >
            <ImageIcon />
          </ToggleButton>
          <ToggleButton
            value="all"
            selected={selectedActions.includes('all')}
            onClick={() => toggleAction('all')}
            aria-label="Do all 3"
            color="primary"
            sx={{ width: 64, height: 48, p: 0 }}
          >
            <Stack direction="row" spacing={0.2} sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }}>
              <CallToActionIcon />
              <CalendarMonthIcon />
              <ImageIcon />
            </Stack>
          </ToggleButton>
        </Box>
        <Stack spacing={0.5} alignItems="center">
          <IconButton size="small" onClick={handleConfirm} color="primary" aria-label="Confirm">
            <CheckIcon />
          </IconButton>
          <IconButton size="small" onClick={handleAbort} color="default" aria-label="Cancel">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
