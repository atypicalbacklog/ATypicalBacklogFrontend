import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { GameDTO } from '../../types/dto';

type GameFormProps = {
  initial?: Partial<GameDTO>;
  onSubmit: (data: Omit<GameDTO, 'uid'>) => void | Promise<void>;
  submitLabel?: string;
};

export default function GameForm({ initial, onSubmit, submitLabel = 'Save' }: GameFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [firstReleaseDate, setFirstReleaseDate] = useState(initial?.firstReleaseDate ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, firstReleaseDate });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} maxWidth={400}>
      <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required fullWidth />
      <TextField
        type="date"
        label="First release date"
        value={firstReleaseDate}
        onChange={e => setFirstReleaseDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <Button type="submit" variant="contained">
        {submitLabel}
      </Button>
    </Box>
  );
}
