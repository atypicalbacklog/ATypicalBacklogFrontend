import { Box, IconButton, Stack, Typography } from '@mui/material';

const THUMBNAIL_BASE = '/api/thumbnails';

interface Props {
  label: string;
  thumbnailImageUid: string | null;
  onClear: () => void;
}

export default function SelectedItemChip({
  label,
  thumbnailImageUid,
  onClear,
}: Props) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {thumbnailImageUid ? (
        <Box
          component="img"
          src={`${THUMBNAIL_BASE}/${thumbnailImageUid}`}
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
