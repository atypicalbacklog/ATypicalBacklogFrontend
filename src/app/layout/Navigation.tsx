import { List, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav aria-label="Primary Navigation">
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
        <ListItemButton component={Link} to="/playthroughs/new">
          <ListItemText primary="Add Playthrough" />
        </ListItemButton>
        <ListItemButton component={Link} to="/reviews/year-tierlist">
          <ListItemText primary="Manage Year Tierlist" />
        </ListItemButton>
      </List>
    </nav>
  );
}
