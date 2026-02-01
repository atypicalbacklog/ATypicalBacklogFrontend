import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  CreateGameInstanceRequest,
  UpdateGameInstanceRequest,
  GameInstanceDTO,
} from '../../types/dto';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';

type CreateProps = {
  mode: 'create';
  initial?: Partial<CreateGameInstanceRequest>;
  onSubmit: (data: CreateGameInstanceRequest) => void | Promise<void>;
  submitLabel?: string;
};

type UpdateProps = {
  mode: 'update';
  initial: Partial<GameInstanceDTO>;
  onSubmit: (data: UpdateGameInstanceRequest) => void | Promise<void>;
  submitLabel?: string;
};

type GameInstanceFormProps = CreateProps | UpdateProps;

export default function GameInstanceForm(props: GameInstanceFormProps) {
  const { mode, onSubmit, submitLabel = 'Save' } = props;
  const initial = props.initial ?? {};

  const { referenceData, isLoaded } = useReferenceData();

  const [gameUid, setGameUid] = useState(initial.gameUid ?? '');
  const [platformUid, setPlatformUid] = useState(initial.platformUid ?? '');
  const [variantUid, setVariantUid] = useState(initial.variantUid ?? '');
  const [name, setName] = useState(initial.name ?? '');
  const [releaseDate, setReleaseDate] = useState(initial.releaseDate ?? '');
  const [originalConsoleUid, setOriginalConsoleUid] = useState(
    initial.originalConsoleUid ?? ''
  );
  const [receivedDate, setReceivedDate] = useState(initial.receivedDate ?? '');
  const [forFree, setForFree] = useState(initial.forFree ?? false);
  const [inPossession, setInPossession] = useState(
    initial.inPossession ?? false
  );

  const consoles = referenceData?.data.consoles ?? [];
  const platforms = referenceData?.data.platforms.filter(
    (p) => !p.hideInChoices
  ) ?? [];
  const variants = referenceData?.data.variants ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      onSubmit({
        gameUid,
        platformUid,
        variantUid: variantUid || '',
        name: name || null,
        releaseDate: releaseDate || null,
        originalConsoleUid: originalConsoleUid || null,
        receivedDate: receivedDate || null,
        forFree,
        inPossession,
      });
    } else {
      onSubmit({
        platformUid: platformUid || null,
        variantUid: variantUid || null,
        name: name || null,
        releaseDate: releaseDate || null,
        originalConsoleUid: originalConsoleUid || null,
        receivedDate: receivedDate || null,
        forFree,
        inPossession,
      });
    }
  };

  const canSubmit =
    mode === 'create'
      ? Boolean(gameUid && platformUid && variantUid)
      : true;

  if (!isLoaded) return null;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
      maxWidth={400}
    >
      {mode === 'create' && (
        <TextField
          label="Game UID"
          value={gameUid}
          onChange={(e) => setGameUid(e.target.value)}
          required
          fullWidth
        />
      )}

      <FormControl fullWidth required={mode === 'create'}>
        <InputLabel>Platform</InputLabel>
        <Select
          label="Platform"
          value={platformUid}
          onChange={(e) => setPlatformUid(e.target.value)}
        >
          {mode === 'update' && (
            <MenuItem value="">
              <em>—</em>
            </MenuItem>
          )}
          {platforms.map((p) => (
            <MenuItem key={p.uid} value={p.uid}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required={mode === 'create'}>
        <InputLabel>Variant</InputLabel>
        <Select
          label="Variant"
          value={variantUid}
          onChange={(e) => setVariantUid(e.target.value)}
        >
          {mode === 'update' && (
            <MenuItem value="">
              <em>—</em>
            </MenuItem>
          )}
          {variants.map((v) => (
            <MenuItem key={v.uid} value={v.uid}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />

      <TextField
        type="date"
        label="Release date"
        value={releaseDate}
        onChange={(e) => setReleaseDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <FormControl fullWidth>
        <InputLabel>Original console</InputLabel>
        <Select
          label="Original console"
          value={originalConsoleUid}
          onChange={(e) => setOriginalConsoleUid(e.target.value)}
        >
          <MenuItem value="">
            <em>—</em>
          </MenuItem>
          {consoles.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.fullname || c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="date"
        label="Received date"
        value={receivedDate}
        onChange={(e) => setReceivedDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={forFree}
            onChange={(e) => setForFree(e.target.checked)}
          />
        }
        label="For free"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={inPossession}
            onChange={(e) => setInPossession(e.target.checked)}
          />
        }
        label="In possession"
      />

      <Button type="submit" variant="contained" disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </Box>
  );
}
