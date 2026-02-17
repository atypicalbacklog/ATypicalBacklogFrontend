import { Box, Typography } from '@mui/material';
import type { GameInstanceDetailDTO } from '../../../types/dto';
import DateWithIcon from '../../shared/DateWithIcon';
import VariantConsolePlatformDisplay from '../../shared/VariantConsolePlatformDisplay';

interface Props {
  instance: GameInstanceDetailDTO;
  variantName: string;
  platformName: string;
  /** Name of the console this platform belongs to (for display logic) */
  platformConsoleName: string;
  /** Original console display name for "Orig:" part */
  originalConsoleName: string | null;
  /** When true, only show platform, release date, IGDB ID (for left column). */
  leftSection?: boolean;
  /** When true, only show received date (for right column). */
  rightSection?: boolean;
}

export default function InstanceDetailsCard({
  instance,
  variantName,
  platformName,
  platformConsoleName,
  originalConsoleName,
  leftSection = false,
  rightSection = false,
}: Props) {
  if (rightSection) {
    return (
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Received
        </Typography>
        <DateWithIcon date={instance.receivedDate} tooltip="Received" variant="body2" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {leftSection ? 'Platform' : 'Game instance'}
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
      {!leftSection && instance.name && (
        <Typography variant="body2">Name: {instance.name}</Typography>
      )}
      <DateWithIcon date={instance.releaseDate} tooltip="Release Date" variant="body2" />
      {!leftSection && (
        <DateWithIcon date={instance.receivedDate} tooltip="Received" variant="body2" />
      )}
      {instance.externalIgdbId && (
        <Typography variant="body2">
          IGDB ID: {instance.externalIgdbId}
        </Typography>
      )}
      {!leftSection && (
        <Typography variant="body2">
          In possession: {instance.inPossession ? 'Yes' : 'No'}
        </Typography>
      )}
    </Box>
  );
}
