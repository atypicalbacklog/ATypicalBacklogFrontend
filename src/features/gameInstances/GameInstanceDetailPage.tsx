import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { GameInstanceDTO } from '../../types/dto';
import GameInstanceForm from './GameInstanceForm';
import PlaySessionControls from '../playSessions/PlaySessionControls';

export default function GameInstanceDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [instance, setInstance] = useState<GameInstanceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    GameInstanceApi.get(uid)
      .then(setInstance)
      .catch(() => setError('Failed to load game instance'))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleUpdate = (data: Omit<GameInstanceDTO, 'uid'>) => {
    if (!uid) return;
    return GameInstanceApi.update(uid, data).then(setInstance);
  };

  if (loading) return <CircularProgress />;
  if (error || !instance) return <Typography color="error">{error ?? 'Game instance not found'}</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Game Instance</Typography>
        <Button component={Link} to="/" size="small">
          Back to Dashboard
        </Button>
      </Box>
      <Typography color="text.secondary" gutterBottom>
        Game: {instance.gameUid} · Platform: {instance.platformUid} · Variant: {instance.variantUid}
      </Typography>
      <GameInstanceForm initial={instance} onSubmit={handleUpdate} submitLabel="Update" />
      {uid && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Play session
          </Typography>
          <PlaySessionControls playthroughUid={uid} />
        </Box>
      )}
    </Box>
  );
}
