import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { GameApi } from '../../services/gameApi';
import { GameDTO } from '../../types/dto';
import GameForm from './GameForm';

export default function GameDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [game, setGame] = useState<GameDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    GameApi.get(uid)
      .then(setGame)
      .catch(() => setError('Failed to load game'))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleUpdate = (data: Omit<GameDTO, 'uid'>) => {
    if (!uid) return;
    return GameApi.update(uid, data).then(setGame);
  };

  if (loading) return <CircularProgress />;
  if (error || !game)
    return <Typography color="error">{error ?? 'Game not found'}</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">{game.name}</Typography>
        <Button component={Link} to="/" size="small">
          Back to Dashboard
        </Button>
      </Box>
      <Typography color="text.secondary" gutterBottom>
        First release: {game.firstReleaseDate}
      </Typography>
      <GameForm initial={game} onSubmit={handleUpdate} submitLabel="Update" />
    </Box>
  );
}
