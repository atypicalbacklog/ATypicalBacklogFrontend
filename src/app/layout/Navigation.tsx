import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <Box
      component="nav"
      aria-label="Primary Navigation"
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(4px)',
        minWidth: 200,
        p: 1,
      }}
    >
      <List>
        <ListItemButton component={Link} to="/">
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton component={Link} to="/games">
          <ListItemText primary="Add to Catalog" />
        </ListItemButton>
        <ListItemButton component={Link} to="/library">
          <ListItemText primary="Library" />
        </ListItemButton>
        <ListItemButton component={Link} to="/backlog">
          <ListItemText primary="Backlog" />
        </ListItemButton>
        <ListItemButton component={Link} to="/play-activity/active">
          <ListItemText primary="Active Playthroughs" />
        </ListItemButton>
        <ListItemButton component={Link} to="/reviews/year-tierlist">
          <ListItemText primary="Manage Year Tierlist" />
        </ListItemButton>
        <ListItemButton component={Link} to="/reviews/yearly">
          <ListItemText primary="Yearly review" />
        </ListItemButton>
        <ListItemButton component={Link} to="/statistics">
          <ListItemText primary="Statistics" />
        </ListItemButton>
        <ListItemButton component={Link} to="/backlog-completion-overview">
          <ListItemText primary="Backlog completion overview" />
        </ListItemButton>
      </List>
    </Box>
  );
}
