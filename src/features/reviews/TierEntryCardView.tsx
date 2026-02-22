import { Box } from '@mui/material';
import SmartImage from '../shared/SmartImage';
import type { ReviewSearchResultDto } from '../../types/dto';

interface Props {
  card: ReviewSearchResultDto;
}

/** Read-only tier card: cover only; tooltip = displayName (instance name or game name). */
export default function TierEntryCardView({ card }: Props) {
  return (
    <Box
      title={card.displayName}
      sx={{
        flexShrink: 0,
        width: 155,
        pb: 1,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        boxShadow: 1,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <SmartImage
        imageUid={card.thumbnailImageUid}
        thumbnail
        alt=""
        aspectRatio={2 / 3}
        fit="contain"
        sx={{ width: '100%', height: 210 }}
      />
    </Box>
  );
}
