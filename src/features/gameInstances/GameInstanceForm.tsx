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
  Typography,
} from '@mui/material';
import {
  CreateGameInstanceRequest,
  UpdateGameInstanceRequest,
  GameInstanceDTO,
} from '../../types/dto';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import PlatformSelect from '../shared/PlatformSelect';
import ExternalGameSearch from '../shared/ExternalGameSearch';
import DirectExternalIdBlock from '../shared/DirectExternalIdBlock';

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
  const [externalIgdbId, setExternalIgdbId] = useState<string | null>(
    (initial as { externalIgdbId?: string | null }).externalIgdbId ?? null
  );
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
    if (mode === 'create') {
      await onSubmit({
        gameUid,
        platformUid,
        variantUid: variantUid || '',
        name: name || null,
        releaseDate: releaseDate || null,
        originalConsoleUid: originalConsoleUid || null,
        receivedDate: receivedDate || null,
        forFree,
        inPossession,
        externalIgdbId: externalIgdbId || null,
      });
    } else {
      await onSubmit({
        platformUid: platformUid || null,
        variantUid: variantUid || null,
        name: name || null,
        releaseDate: releaseDate || null,
        originalConsoleUid: originalConsoleUid || null,
        receivedDate: receivedDate || null,
        forFree,
        inPossession,
        externalIgdbId: externalIgdbId ?? undefined,
      });
    }
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
      maxWidth={640}
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

      {/* Name + search in same row */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            sx={{ flex: '1 1 200px', minWidth: 200 }}
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
              onSetExternalId={(id) => setExternalIgdbId(id)}
              ownerType="GAME_INSTANCE"
              ownerUid={mode === 'update' ? (props.initial as GameInstanceDTO).uid : null}
            />
          </Box>
          {externalIgdbId && (
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              IGDB ID: {externalIgdbId}
            </Typography>
          )}
          <DirectExternalIdBlock
            onConfirm={(res, actions) => {
              if (actions.name) setName(res.name);
              if (actions.date && res.releaseDate) setReleaseDate(res.releaseDate);
              if (actions.image) setPendingCoverImport(res.externalId);
              setExternalIgdbId(String(res.externalId));
            }}
          />
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

      {/* Platform + Original console */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <PlatformSelect
          value={platformUid}
          onChange={(v) => {
            if (v === undefined || v === null) return;
            setPlatformUid(typeof v === 'string' ? v : (Array.isArray(v) && v[0]) || '');
          }}
          required={mode === 'create'}
          allowEmpty={mode === 'update'}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
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
      </Box>

      {/* Variant + Received date */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }} required={mode === 'create'}>
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
          type="date"
          label="Received date"
          value={receivedDate}
          onChange={(e) => setReceivedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 140 }}
        />
      </Box>

      {/* For free / In possession */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
      </Box>

      <Button type="submit" variant="contained" disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </Box>
  );
}
