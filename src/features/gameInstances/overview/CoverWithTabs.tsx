import { useState, useMemo } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import TabScrollButton from '@mui/material/TabScrollButton';
import type { TabScrollButtonProps } from '@mui/material/TabScrollButton';
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

  const coverWidth = { xs: 120, sm: 200 };
  const coverHeight = { xs: 188, sm: 300 };

  if (sources.length === 0) {
    return (
      <Box
        sx={{
          width: coverWidth,
          height: coverHeight,
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
          sx={{ width: coverWidth, height: coverHeight, borderRadius: 1 }}
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
        sx={{ width: coverWidth, height: coverHeight, borderRadius: 1 }}
        imgSx={{ borderRadius: 1 }}
      />
    );
  }

  const handlePrevCover = () =>
    setCoverTab((v) => (v === 0 ? sources.length - 1 : v - 1));
  const handleNextCover = () =>
    setCoverTab((v) => (v === sources.length - 1 ? 0 : v + 1));

  const CoverTabScrollButton = ({ direction, ...props }: TabScrollButtonProps) => (
    <TabScrollButton
      {...props}
      direction={direction}
      aria-label={direction === 'left' ? 'Previous cover' : 'Next cover'}
      onClick={(e) => {
        e.preventDefault();
        if (direction === 'left') handlePrevCover();
        else handleNextCover();
      }}
      sx={{
        p: 0.125,
        mx: 0.125,
        minWidth: 25,
        width: 25,
      }}
    />
  );

  return (
    <Box sx={{ width: 'fit-content' }}>
      <Tabs
        value={coverTab}
        onChange={(_, v) => setCoverTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        ScrollButtonComponent={CoverTabScrollButton}
        sx={{
          width: coverWidth,
          maxWidth: coverWidth,
          overflow: 'hidden',
          minHeight: { xs: 22, sm: 26 },
          mb: 0.5,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          borderRadius: '4px 4px 0 0',
          '& .MuiTabs-scroller': {
            overflow: 'hidden !important',
          },
          '& .MuiTab-root': {
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
            minHeight: { xs: 22, sm: 26 },
            py: 0,
            px: { xs: 0.5, sm: 0.75 },
            fontSize: { xs: '0.6875rem', sm: '0.75rem' },
          },
          '& .Mui-selected': {
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
          },
        }}
      >
        {sources.map((s, i) => (
          <Tab key={s.id} label={s.label} id={`cover-tab-${i}`} sx={{ minHeight: { xs: 22, sm: 26 }, py: 0, px: { xs: 0.5, sm: 0.75 }, fontSize: { xs: '0.6875rem', sm: '0.75rem' } }} />
        ))}
      </Tabs>
      <SmartImage
        imageUid={selected.imageUid}
        thumbnail={false}
        alt="Cover"
        aspectRatio={2 / 3}
        fit="contain"
        sx={{ width: coverWidth, height: coverHeight, borderRadius: 1 }}
        imgSx={{ borderRadius: 1 }}
      />
    </Box>
  );
}
