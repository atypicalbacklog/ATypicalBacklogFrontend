import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { GameDTO } from '../../types/dto';
import ExternalGameSearch from '../shared/ExternalGameSearch';

type GameFormProps = {
  initial?: Partial<GameDTO>;
  onSubmit: (data: Omit<GameDTO, 'uid'>) => void | Promise<void>;
  submitLabel?: string;
};

export default function GameForm({
  initial,
  onSubmit,
  submitLabel = 'Save',
}: GameFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [firstReleaseDate, setFirstReleaseDate] = useState(initial?.firstReleaseDate ?? '');
  const [pendingCoverImport, setPendingCoverImport] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      firstReleaseDate,
      coverImageUid: initial?.coverImageUid ?? null,
    });
    // Import cover after save if marked
    if (pendingCoverImport && initial?.uid) {
      try {
        const { IgdbApi } = await import('../../services/igdbApi');
        await IgdbApi.importCover({
          externalId: pendingCoverImport,
          ownerType: 'GAME',
          gameUid: initial.uid,
        });
        setPendingCoverImport(null);
      } catch {
        // Error handling can be added
      }
    }
  };


  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} maxWidth={400}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '1 1 auto', minWidth: 200, order: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <Box sx={{ flexShrink: 0 }}>
            <ExternalGameSearch
              gameName={name}
              releaseDate={firstReleaseDate}
              onOverwriteName={(newName) => setName(newName)}
              onOverwriteDate={(newDate) => setFirstReleaseDate(newDate)}
              onMarkCoverImport={(externalId) => {
                setPendingCoverImport(externalId);
              }}
              ownerType="GAME"
              ownerUid={initial?.uid ?? null}
            />
          </Box>
        </Box>
      </Box>
      <TextField
        type="date"
        label="Release date"
        value={firstReleaseDate}
        onChange={(e) => setFirstReleaseDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <Button type="submit" variant="contained">
        {submitLabel}
      </Button>
    </Box>
  );
}
