import { Box, IconButton, Stack, Typography } from '@mui/material';
import { getImageUrl } from '../../../services/imageApi';

interface Props {
  label: string;
  coverImageUid: string | null;
  onClear: () => void;
}

export default function SelectedItemChip({
  label,
  coverImageUid,
  onClear,
}: Props) {
  const imageUrl = getImageUrl(coverImageUid, true);
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt=""
          sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 0.5 }}
        />
      ) : (
        <Box sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: 0.5 }} />
      )}
      <Typography variant="body2" sx={{ minWidth: 0 }} noWrap>
        {label}
      </Typography>
      <IconButton size="small" onClick={onClear} aria-label="Clear selection">
        ×
      </IconButton>
    </Stack>
  );
}
