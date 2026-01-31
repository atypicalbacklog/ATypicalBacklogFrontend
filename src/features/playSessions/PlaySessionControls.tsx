import { useState } from 'react';
import { Button, Stack } from '@mui/material';
import { PlaySessionApi } from '../../services/playSessionApi';

type PlaySessionControlsProps = {
  playthroughUid: string;
};

export default function PlaySessionControls({ playthroughUid }: PlaySessionControlsProps) {
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    PlaySessionApi.start(playthroughUid)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleStop = () => {
    setLoading(true);
    PlaySessionApi.stop(playthroughUid)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={handleStart} disabled={loading}>
        Start session
      </Button>
      <Button variant="outlined" onClick={handleStop} disabled={loading}>
        Stop session
      </Button>
    </Stack>
  );
}
