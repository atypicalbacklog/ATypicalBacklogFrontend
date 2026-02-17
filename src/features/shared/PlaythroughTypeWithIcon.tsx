import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

function getTypeIcon(typeName: string | null | undefined, fontSize: 'inherit' | number) {
  if (!typeName) return null;
  const normalized = typeName.toLowerCase();
  const sx = typeof fontSize === 'number' ? { fontSize } : {};
  if (normalized === 'solo') return <PersonIcon sx={sx} />;
  if (normalized === 'coop') return <GroupIcon sx={sx} />;
  if (normalized === 'multiplayer') return <GroupsIcon sx={sx} />;
  if (normalized === 'casual') return <BeachAccessIcon sx={sx} />;
  return null;
}

export type PlaythroughTypeSize = 'small' | 'medium' | 'large' | 'header';

const sizeMap: Record<
  PlaythroughTypeSize,
  { iconSize: number; variant: 'caption' | 'body2' | 'body1' | 'h6' }
> = {
  small: { iconSize: 16, variant: 'caption' },
  medium: { iconSize: 20, variant: 'body2' },
  large: { iconSize: 24, variant: 'body1' },
  header: { iconSize: 28, variant: 'h6' },
};

interface Props {
  typeName: string | null | undefined;
  /** Visual size for icon and label. */
  size?: PlaythroughTypeSize;
}

export default function PlaythroughTypeWithIcon({
  typeName,
  size = 'medium',
}: Props) {
  const { iconSize, variant } = sizeMap[size];
  const icon = getTypeIcon(typeName, iconSize);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Typography
        variant={variant}
        component="span"
        fontWeight={variant === 'h6' ? 600 : undefined}
        noWrap={variant === 'h6'}
      >
        {typeName ?? '—'}
      </Typography>
    </Box>
  );
}
