import { useState } from 'react';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { GameInstanceSummaryDto } from '../../../types/dto';
import SmartImage from '../../shared/SmartImage';
import VariantConsolePlatformDisplay, {
  type VariantConsolePlatformDisplayProps,
} from '../../shared/VariantConsolePlatformDisplay';

interface Props {
  instances: GameInstanceSummaryDto[];
  currentUid: string;
  /** Optional display info for the currently selected instance */
  currentVariantConsoleDisplay?: VariantConsolePlatformDisplayProps;
}

export default function InstanceSwitcher({
  instances,
  currentUid,
  currentVariantConsoleDisplay,
}: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const current = instances.find((i) => i.uid === currentUid);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton
        size="small"
        aria-label="Switch instance"
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        ☰
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <List dense disablePadding sx={{ minWidth: 220 }}>
          {instances.map((inst) => {
            const isCurrent = inst.uid === currentUid;
            return (
              <ListItemButton
                key={inst.uid}
                component={Link}
                to={`/game-instances/${inst.uid}`}
                selected={isCurrent}
                onClick={() => setAnchor(null)}
              >
                <SmartImage
                  imageUid={inst.coverImageUid}
                  thumbnail={false}
                  alt=""
                  aspectRatio={2 / 3}
                  fit="contain"
                  sx={{ width: 40, height: 40, borderRadius: 0.5, mr: 1.5 }}
                  imgSx={{ borderRadius: 0.5 }}
                />
                <ListItemText
                  primary={inst.name || inst.uid}
                  primaryTypographyProps={{ noWrap: true }}
                  secondary={
                    isCurrent && currentVariantConsoleDisplay ? (
                      <VariantConsolePlatformDisplay
                        {...currentVariantConsoleDisplay}
                        variant="caption"
                        color="text.secondary"
                      />
                    ) : undefined
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Menu>
      {current && (
        <Typography variant="body2" color="text.secondary">
          {current.name || current.uid}
        </Typography>
      )}
    </Box>
  );
}
