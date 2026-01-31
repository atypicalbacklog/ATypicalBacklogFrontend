import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { GameInstanceDTO } from '../../types/dto';

type GameInstanceFormProps = {
  initial?: Partial<GameInstanceDTO>;
  onSubmit: (data: Omit<GameInstanceDTO, 'uid'>) => void | Promise<void>;
  submitLabel?: string;
};

export default function GameInstanceForm({ initial, onSubmit, submitLabel = 'Save' }: GameInstanceFormProps) {
  const [gameUid, setGameUid] = useState(initial?.gameUid ?? '');
  const [platformUid, setPlatformUid] = useState(initial?.platformUid ?? '');
  const [variantUid, setVariantUid] = useState(initial?.variantUid ?? '');
  const [receivedDate, setReceivedDate] = useState(initial?.receivedDate ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ gameUid, platformUid, variantUid, receivedDate });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} maxWidth={400}>
      <TextField label="Game UID" value={gameUid} onChange={e => setGameUid(e.target.value)} required fullWidth />
      <TextField label="Platform UID" value={platformUid} onChange={e => setPlatformUid(e.target.value)} required fullWidth />
      <TextField label="Variant UID" value={variantUid} onChange={e => setVariantUid(e.target.value)} fullWidth />
      <TextField
        type="date"
        label="Received date"
        value={receivedDate}
        onChange={e => setReceivedDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <Button type="submit" variant="contained">
        {submitLabel}
      </Button>
    </Box>
  );
}
