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
import PlatformSelect from '../shared/PlatformSelect';
import ExternalGameSearch from '../shared/ExternalGameSearch';

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
  const [pendingCoverImport, setPendingCoverImport] = useState<number | null>(null);
  const [originalConsoleUid, setOriginalConsoleUid] = useState(
    initial.originalConsoleUid ?? ''
  );
  const [receivedDate, setReceivedDate] = useState(initial.receivedDate ?? '');
  const [forFree, setForFree] = useState(initial.forFree ?? false);
  const [inPossession, setInPossession] = useState(
    initial.inPossession ?? false
  );

  const consoles = referenceData?.data.consoles ?? [];
  const variants = referenceData?.data.variants ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      mode === 'create'
        ? {
            gameUid,
            platformUid,
            variantUid: variantUid || '',
            name: name || null,
            releaseDate: releaseDate || null,
            originalConsoleUid: originalConsoleUid || null,
            receivedDate: receivedDate || null,
            forFree,
            inPossession,
          }
        : {
            platformUid: platformUid || null,
            variantUid: variantUid || null,
            name: name || null,
            releaseDate: releaseDate || null,
            originalConsoleUid: originalConsoleUid || null,
            receivedDate: receivedDate || null,
            forFree,
            inPossession,
          }
    );
    // Import cover after save if marked (only in update mode where we have uid)
    if (pendingCoverImport && mode === 'update') {
      const instanceUid = (props.initial as GameInstanceDTO).uid;
      try {
        const { IgdbApi } = await import('../../services/igdbApi');
        await IgdbApi.importCover({
          externalId: pendingCoverImport,
          ownerType: 'GAME_INSTANCE',
          gameInstanceUid: instanceUid,
        });
        setPendingCoverImport(null);
      } catch {
        // Error handling can be added
      }
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

      <PlatformSelect
        value={platformUid}
        onChange={(v) => setPlatformUid(typeof v === 'string' ? v : v[0] || '')}
        required={mode === 'create'}
        allowEmpty={mode === 'update'}
      />

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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '1 1 auto', minWidth: 200, order: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <Box sx={{ flexShrink: 0 }}>
            <ExternalGameSearch
              gameName={name || ''}
              releaseDate={releaseDate || ''}
              onOverwriteName={(newName) => setName(newName)}
              onOverwriteDate={(newDate) => setReleaseDate(newDate)}
              onMarkCoverImport={(externalId) => {
                setPendingCoverImport(externalId);
              }}
              ownerType="GAME_INSTANCE"
              ownerUid={mode === 'update' ? (props.initial as GameInstanceDTO).uid : null}
            />
          </Box>
        </Box>
      </Box>

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
