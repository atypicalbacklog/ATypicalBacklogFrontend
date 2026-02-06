import { Box, Typography } from '@mui/material';
import type { GameInstanceDetailDTO } from '../../../types/dto';

interface Props {
  instance: GameInstanceDetailDTO;
  platformName: string;
  variantName: string;
  consoleName: string;
}

export default function InstanceDetailsCard({
  instance,
  platformName,
  variantName,
  consoleName,
}: Props) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Game instance
      </Typography>
      <Typography variant="body2">
        Platform: {platformName}
      </Typography>
      <Typography variant="body2">
        Variant: {variantName}
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
      {instance.originalConsoleUid && (
        <Typography variant="body2">
          Original console: {consoleName}
        </Typography>
      )}
      <Typography variant="body2">
        In possession: {instance.inPossession ? 'Yes' : 'No'}
      </Typography>
    </Box>
  );
}
