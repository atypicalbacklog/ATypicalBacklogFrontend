import { useState, useMemo } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import type { GameDTO, GameInstanceDetailDTO, GameInstanceSummaryDto } from '../../../types/dto';
import SmartImage from '../../shared/SmartImage';

interface Props {
  instance: GameInstanceDetailDTO;
  game: GameDTO | null;
  /** All instances of the same game (including current). */
  instances: GameInstanceSummaryDto[];
}

type CoverSource = { id: string; label: string; imageUid: string };

export default function CoverWithTabs({ instance, game, instances }: Props) {
  const sources = useMemo((): CoverSource[] => {
    const list: CoverSource[] = [];
    const instanceCover = instance.coverImageUid ?? null;
    const gameCover = game?.coverImageUid ?? null;
    if (instanceCover)
      list.push({ id: 'instance', label: 'Cover', imageUid: instanceCover });
    if (gameCover && gameCover !== instanceCover)
      list.push({ id: 'game', label: 'Base', imageUid: gameCover });
    instances
      .filter((i) => i.uid !== instance.uid && i.coverImageUid)
      .forEach((i) => {
        const uid = i.coverImageUid!;
        if (!list.some((s) => s.imageUid === uid))
          list.push({
            id: `inst-${i.uid}`,
            label: i.name || 'Other',
            imageUid: uid,
          });
      });
    return list;
  }, [instance, game, instances]);

  const [coverTab, setCoverTab] = useState(0);
  const selected = sources[coverTab] ?? sources[0];

  if (sources.length === 0) {
    return (
      <Box
        sx={{
          width: 200,
          height: 280,
          borderRadius: 1,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SmartImage
          imageUid={null}
          thumbnail={false}
          alt=""
          aspectRatio={2 / 3}
          fit="contain"
          sx={{ width: 200, height: 280, borderRadius: 1 }}
          imgSx={{ borderRadius: 1 }}
        />
      </Box>
    );
  }

  if (sources.length === 1) {
    return (
      <SmartImage
        imageUid={sources[0].imageUid}
        thumbnail={false}
        alt="Cover"
        aspectRatio={2 / 3}
        fit="contain"
        sx={{ width: 200, height: 280, borderRadius: 1 }}
        imgSx={{ borderRadius: 1 }}
      />
    );
  }

  return (
    <Box sx={{ width: 'fit-content' }}>
      <Tabs
        value={coverTab}
        onChange={(_, v) => setCoverTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 28,
          mb: 0.5,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          borderRadius: '4px 4px 0 0',
          '& .MuiTab-root': {
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
            minHeight: 28,
            py: 0,
            fontSize: '0.75rem',
          },
          '& .Mui-selected': {
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
          },
        }}
      >
        {sources.map((s, i) => (
          <Tab key={s.id} label={s.label} id={`cover-tab-${i}`} sx={{ minHeight: 28, py: 0, fontSize: '0.75rem' }} />
        ))}
      </Tabs>
      <SmartImage
        imageUid={selected.imageUid}
        thumbnail={false}
        alt="Cover"
        aspectRatio={2 / 3}
        fit="contain"
        sx={{ width: 200, height: 280, borderRadius: 1 }}
        imgSx={{ borderRadius: 1 }}
      />
    </Box>
  );
}
