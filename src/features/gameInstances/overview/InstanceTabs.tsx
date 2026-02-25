import { Tab, Tabs } from '@mui/material';
import { Link } from 'react-router-dom';
import type { GameInstanceSummaryDto } from '../../../types/dto';

interface Props {
  instances: GameInstanceSummaryDto[];
  currentUid: string;
  /** Optional: resolve tab label per instance (e.g. variant name when instance has no name). */
  getInstanceLabel?: (inst: GameInstanceSummaryDto) => string;
}

export default function InstanceTabs({ instances, currentUid, getInstanceLabel }: Props) {
  const currentIndex = Math.max(
    0,
    instances.findIndex((i) => i.uid === currentUid)
  );

  const label = (inst: GameInstanceSummaryDto) =>
    getInstanceLabel ? getInstanceLabel(inst) : (inst.name || inst.uid);

  return (
    <Tabs
      value={currentIndex}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: { xs: 36, sm: 40 },
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
        '& .MuiTab-root': {
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          minHeight: { xs: 36, sm: 40 },
          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
        },
        '& .Mui-selected': {
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
        },
      }}
    >
      {instances.map((inst, index) => (
        <Tab
          key={inst.uid}
          component={Link}
          to={`/game-instances/${inst.uid}`}
          label={label(inst)}
          value={index}
          id={`instance-tab-${index}`}
          sx={{ minHeight: { xs: 36, sm: 40 } }}
        />
      ))}
    </Tabs>
  );
}
