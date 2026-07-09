import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GamesIcon from '@mui/icons-material/Games';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import ReviewsIcon from '@mui/icons-material/Reviews';
import BarChartIcon from '@mui/icons-material/BarChart';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import InventoryIcon from '@mui/icons-material/Inventory';
import PublicIcon from '@mui/icons-material/Public';
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
        width: 280,
        flexShrink: 0,
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
          <ListItemText primary={mode === 'MANAGEMENT' ? 'Active Playthroughs' : 'Home'} />
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
        <ListItemButton
          component={Link}
          to="/backlog-completion-overview"
          onClick={onNavigate}
          sx={{ py: 1.25, px: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PlaylistAddCheckIcon />
          </ListItemIcon>
          <ListItemText primary="Completion overview" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/backlog-submissions"
          onClick={onNavigate}
          sx={{ py: 1.25, px: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HowToVoteIcon />
          </ListItemIcon>
          <ListItemText primary="Backlog submissions" />
        </ListItemButton>
        <ListItemButton component={Link} to="/reviews" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ReviewsIcon />
          </ListItemIcon>
          <ListItemText primary="Reviews" />
        </ListItemButton>
        <ListItemButton component={Link} to="/statistics" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItemButton>
        {mode === 'MANAGEMENT' && (
          <ListItemButton component={Link} to="/public" onClick={onNavigate} sx={{ py: 1.25, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PublicIcon />
            </ListItemIcon>
            <ListItemText primary="Public" />
          </ListItemButton>
        )}
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
