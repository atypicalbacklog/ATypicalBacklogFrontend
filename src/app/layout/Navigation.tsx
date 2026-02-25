import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GamesIcon from '@mui/icons-material/Games';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import ReviewsIcon from '@mui/icons-material/Reviews';
import InventoryIcon from '@mui/icons-material/Inventory';
import { getAppConfig } from '../AppConfig';

interface NavigationProps {
  onNavigate?: () => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const { mode } = getAppConfig();

  return (
    <Box
      component="nav"
      aria-label="Primary Navigation"
      sx={{
        bgcolor: 'background.paper',
        minWidth: 200,
        height: '100%',
        py: 1,
        px: 0,
      }}
    >
      <List dense disablePadding>
        <ListItemButton component={Link} to="/" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PendingActionsIcon />
          </ListItemIcon>
          <ListItemText primary={mode === 'MANAGEMENT' ? 'Active Playthroughs' : 'Dashboard'} />
        </ListItemButton>
        <ListItemButton component={Link} to="/library" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <GamesIcon />
          </ListItemIcon>
          <ListItemText primary="Library" />
        </ListItemButton>
        <ListItemButton component={Link} to="/backlog" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <BookmarksIcon />
          </ListItemIcon>
          <ListItemText primary="Backlog" />
        </ListItemButton>
        <ListItemButton component={Link} to="/reviews" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ReviewsIcon />
          </ListItemIcon>
          <ListItemText primary="Reviews" />
        </ListItemButton>
        {mode === 'MANAGEMENT' && (
          <ListItemButton component={Link} to="/admin/import/staging" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Import Staging" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );
}
