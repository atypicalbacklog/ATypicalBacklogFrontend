import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { GameDTO } from '../../../types/dto';
import { getImageUrl } from '../../../services/imageApi';

interface Props {
  game: GameDTO;
}

export default function GameInfoBlock({ game }: Props) {
  const coverUrl = getImageUrl(game.coverImageUid, false);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {coverUrl ? (
        <Box
          component="img"
          src={coverUrl}
          alt=""
          sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }}
        />
      ) : (
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        />
      )}
      <Typography variant="h5" component="span">
        {game.name}
      </Typography>
    </Box>
  );
}
