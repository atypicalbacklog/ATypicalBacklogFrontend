import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
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
    const key = `game-detail-${uid}`;
    if (!initialFetchBegin(key)) return;
    GameApi.get(uid)
      .then(setGame)
      .catch(() => setError('Failed to load game'))
      .finally(() => {
        setLoading(false);
        initialFetchEnd(key);
      });
  }, [uid]);

  const handleUpdate = async (data: Omit<GameDTO, 'uid'>) => {
    if (!uid) return;
    await GameApi.update(uid, data).then(setGame);
  };

  if (loading) return <CircularProgress />;
  if (error || !game)
    return <Typography color="error">{error ?? 'Game not found'}</Typography>;

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          width: 'fit-content',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4">{game.name}</Typography>
          <Button component={Link} to="/library" size="small">
            Back to Library
          </Button>
        </Box>
        <GameForm
          initial={game}
          onSubmit={handleUpdate}
          submitLabel="Update"
        />
      </Paper>
    </Box>
  );
}
