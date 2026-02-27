import { IconButton, Stack, Typography } from '@mui/material';
import SmartImage from './SmartImage';

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
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
      <SmartImage
        imageUid={coverImageUid}
        thumbnail
        alt=""
        aspectRatio={2 / 3}
        fit="contain"
        sx={{ width: 40, height: 40, borderRadius: 0.5 }}
        imgSx={{ borderRadius: 0.5 }}
      />
      <Typography variant="body2" sx={{ minWidth: 0 }} noWrap>
        {label}
      </Typography>
      <IconButton size="small" onClick={onClear} aria-label="Clear selection">
        ×
      </IconButton>
    </Stack>
  );
}