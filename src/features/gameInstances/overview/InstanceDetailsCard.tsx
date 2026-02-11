import { Box, Typography } from '@mui/material';
import type { GameInstanceDetailDTO } from '../../../types/dto';
import VariantConsolePlatformDisplay from '../../shared/VariantConsolePlatformDisplay';

interface Props {
  instance: GameInstanceDetailDTO;
  variantName: string;
  platformName: string;
  /** Name of the console this platform belongs to (for display logic) */
  platformConsoleName: string;
  /** Original console display name for "Orig:" part */
  originalConsoleName: string | null;
}

export default function InstanceDetailsCard({
  instance,
  variantName,
  platformName,
  platformConsoleName,
  originalConsoleName,
}: Props) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Game instance
      </Typography>
      <Typography variant="body2" component="div">
        <VariantConsolePlatformDisplay
          variantName={variantName}
          platformName={platformName}
          platformConsoleName={platformConsoleName}
          originalConsoleName={originalConsoleName}
          variant="body2"
        />
      </Typography>
      {instance.name && (
        <Typography variant="body2">Name: {instance.name}</Typography>
      )}
      {instance.releaseDate && (
        <Typography variant="body2">
          Release: {instance.releaseDate}
        </Typography>
      )}
      {instance.receivedDate && (
        <Typography variant="body2">
          Received: {instance.receivedDate}
        </Typography>
      )}
      <Typography variant="body2">
        In possession: {instance.inPossession ? 'Yes' : 'No'}
      </Typography>
    </Box>
  );
}
