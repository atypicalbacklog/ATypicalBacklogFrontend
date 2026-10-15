import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GameApi } from '../../services/gameApi';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import PlatformSelect from '../shared/PlatformSelect';

/**
 * UI View Model
 * Pure frontend projection
 */
type GameWithInstancesVM = {
  gameName: string;
  firstReleaseDate: string;
  createInstance: boolean;
  platformUid?: string;
  variantUid?: string;
  receivedDate?: string;
};

export default function GamesPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const navigate = useNavigate();

  const [vm, setVm] = useState<GameWithInstancesVM>({
    gameName: '',
    firstReleaseDate: '',
    createInstance: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hard gate: show loading while reference data loads
  if (!isLoaded || !referenceData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const { variants } = referenceData.data;

  // Sort reference data
  const sortedVariants = [...variants].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const game = await GameApi.create({
        name: vm.gameName,
        firstReleaseDate: vm.firstReleaseDate,
        coverImageUid: null,
      });

      if (vm.createInstance) {
        await GameInstanceApi.create({
          gameUid: game.uid,
          platformUid: vm.platformUid!,
          variantUid: vm.variantUid!,
          receivedDate: vm.receivedDate ?? null,
        });
      }

      // Success feedback
      const message = vm.createInstance
        ? 'Game and instance created successfully!'
        : 'Game created successfully!';
      setSuccessMessage(message);

      // Reset form
      setVm({
        gameName: '',
        firstReleaseDate: '',
        createInstance: false,
      });

      // Navigate to game detail page after a brief delay
      setTimeout(() => {
        navigate(`/games/${game.uid}`);
      }, 1500);
    } catch (err) {
      setError('Failed to save game. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleInstance = () => {
    setVm({
      ...vm,
      createInstance: !vm.createInstance,
      // Clear instance fields when toggling off
      ...(vm.createInstance && {
        platformUid: undefined,
        variantUid: undefined,
        receivedDate: undefined,
      }),
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Games
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add a new game, optionally registering an owned instance.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 480 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mt: 2, maxWidth: 480 }}>
          {successMessage}
        </Alert>
      )}

      <Stack spacing={2} maxWidth={480} mt={2}>
        <TextField
          label="Game Name"
          value={vm.gameName}
          onChange={(e) => setVm({ ...vm, gameName: e.target.value })}
          required
          fullWidth
        />

        <TextField
          label="First Release Date"
          type="date"
          value={vm.firstReleaseDate}
          onChange={(e) =>
            setVm({ ...vm, firstReleaseDate: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />

        <Divider />

        <Button
          variant={vm.createInstance ? 'contained' : 'outlined'}
          onClick={handleToggleInstance}
          disabled={isSubmitting}
        >
          {vm.createInstance ? 'Remove Game Instance' : 'Add Game Instance'}
        </Button>

        {vm.createInstance && (
          <Stack spacing={2}>
            <PlatformSelect
              value={vm.platformUid ?? ''}
              onChange={(v) => {
                if (v === undefined || v === null) return;
                setVm({
                  ...vm,
                  platformUid:
                    typeof v === 'string' ? v : (Array.isArray(v) && v[0]) || undefined,
                });
              }}
              required
            />

            <TextField
              select
              label="Variant"
              value={vm.variantUid ?? ''}
              onChange={(e) =>
                setVm({ ...vm, variantUid: e.target.value })
              }
              required
              fullWidth
            >
              {sortedVariants.map((v) => (
                <MenuItem key={v.uid} value={v.uid}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Received Date"
              type="date"
              value={vm.receivedDate ?? ''}
              onChange={(e) =>
                setVm({ ...vm, receivedDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !vm.gameName ||
            !vm.firstReleaseDate ||
            (vm.createInstance &&
              (!vm.platformUid ||
                !vm.variantUid))
          }
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Stack>
    </Box>
  );
}
