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
          <ListItemText primary="Games" />
        </ListItemButton>
        <ListItemButton component={Link} to="/library">
          <ListItemText primary="Library" />
        </ListItemButton>
      </List>
    </nav>
  );
}
