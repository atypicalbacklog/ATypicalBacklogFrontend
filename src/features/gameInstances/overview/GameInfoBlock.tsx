import { Typography } from '@mui/material';
import type { GameDTO } from '../../../types/dto';

interface Props {
  game: GameDTO;
}

export default function GameInfoBlock({ game }: Props) {
  return (
    <Typography variant="h5" component="span">
      {game.name}
    </Typography>
  );
}
