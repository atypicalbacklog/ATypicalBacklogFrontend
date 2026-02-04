import { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import SegmentControl from './components/SegmentControl';
import AddGameForm from './AddGameForm';
import AddInstanceForm from './AddInstanceForm';
import AddDLCForm from './AddDLCForm';
import type { CatalogMode } from './types';

export default function AddCatalogPage() {
  const { referenceData, isLoaded } = useReferenceData();
  const [mode, setMode] = useState<CatalogMode>('game');

  if (!isLoaded || !referenceData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add to Catalog
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add a new game, instance, or DLC.
      </Typography>

      <SegmentControl value={mode} onChange={setMode} />

      {mode === 'game' && <AddGameForm />}
      {mode === 'instance' && <AddInstanceForm />}
      {mode === 'dlc' && <AddDLCForm />}
    </Box>
  );
}
