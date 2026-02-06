import { Box } from '@mui/material';
import type { GameDTO } from '../../../types/dto';
import type { GameInstanceDetailDTO } from '../../../types/dto';
import { getImageUrl } from '../../../services/imageApi';

interface Props {
  game: GameDTO | null;
  instance: GameInstanceDetailDTO;
}

/** Primary cover: prefer instance cover, fallback to game cover. */
export default function CoverImage({ game, instance }: Props) {
  const uid = instance.coverImageUid ?? game?.coverImageUid ?? null;
  const url = getImageUrl(uid, false);

  if (!url) {
    return (
      <Box
        sx={{
          width: 200,
          minHeight: 280,
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={url}
      alt="Cover"
      sx={{
        width: 200,
        minHeight: 280,
        objectFit: 'cover',
        borderRadius: 1,
      }}
    />
  );
}
