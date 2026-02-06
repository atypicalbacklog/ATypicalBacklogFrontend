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
import { getImageUrl } from '../../../services/imageApi';

interface Props {
  instances: GameInstanceSummaryDto[];
  currentUid: string;
}

export default function InstanceSwitcher({
  instances,
  currentUid,
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
            const coverUrl = getImageUrl(inst.coverImageUid, false);
            return (
              <ListItemButton
                key={inst.uid}
                component={Link}
                to={`/game-instances/${inst.uid}`}
                selected={isCurrent}
                onClick={() => setAnchor(null)}
              >
                {coverUrl ? (
                  <Box
                    component="img"
                    src={coverUrl}
                    alt=""
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      mr: 1.5,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'grey.300',
                      borderRadius: 0.5,
                      mr: 1.5,
                    }}
                  />
                )}
                <ListItemText
                  primary={inst.name || inst.uid}
                  primaryTypographyProps={{ noWrap: true }}
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
