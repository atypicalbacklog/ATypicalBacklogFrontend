import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
} from '@mui/material';
import { GameInstanceApi } from '../../services/gameInstanceApi';
import { GameApi } from '../../services/gameApi';
import { GameInstanceDTO, UpdateGameInstanceRequest } from '../../types/dto';
import { GameDTO } from '../../types/dto';
import GameInstanceForm from './GameInstanceForm';
import PlaySessionControls from '../playSessions/PlaySessionControls';

export default function GameInstanceDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [instance, setInstance] = useState<GameInstanceDTO | null>(null);
  const [game, setGame] = useState<GameDTO | null>(null);
  const [showUids, setShowUids] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    GameInstanceApi.get(uid)
      .then((inst) => {
        setInstance(inst);
        if (inst.gameUid) {
          GameApi.get(inst.gameUid).then(setGame).catch(() => {});
        }
      })
      .catch(() => setError('Failed to load game instance'))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleUpdate = (data: UpdateGameInstanceRequest) => {
    if (!uid) return;
    return GameInstanceApi.update(uid, data).then(setInstance);
  };

  if (loading) return <CircularProgress />;
  if (error || !instance)
    return (
      <Typography color="error">
        {error ?? 'Game instance not found'}
      </Typography>
    );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Game Instance</Typography>
        <Button component={Link} to="/" size="small">
          Back to Dashboard
        </Button>
      </Box>

      {game && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Game (read-only)
          </Typography>
          <Typography variant="body1">{game.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            First release: {game.firstReleaseDate}
          </Typography>
        </Box>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        component="button"
        type="button"
        onClick={() => setShowUids((v) => !v)}
        sx={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'underline',
          mb: 2,
          display: 'block',
        }}
      >
        {showUids ? 'Hide UIDs' : 'Show UIDs'}
      </Typography>
      <Collapse in={showUids}>
        <Typography variant="caption" color="text.secondary" component="pre" sx={{ mb: 2 }}>
          gameUid: {instance.gameUid}
          {'\n'}platformUid: {instance.platformUid}
          {'\n'}variantUid: {instance.variantUid}
        </Typography>
      </Collapse>

      <GameInstanceForm
        mode="update"
        initial={instance}
        onSubmit={handleUpdate}
        submitLabel="Update"
      />
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
