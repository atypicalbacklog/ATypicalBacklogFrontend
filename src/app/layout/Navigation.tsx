import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAppConfig } from '../AppConfig';

export default function Navigation() {
  const { mode } = getAppConfig();

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
          <ListItemText primary={mode === 'MANAGEMENT' ? 'Active Playthroughs' : 'Dashboard'} />
        </ListItemButton>
        <ListItemButton component={Link} to="/library">
          <ListItemText primary="Library" />
        </ListItemButton>
        <ListItemButton component={Link} to="/backlog">
          <ListItemText primary="Backlog" />
        </ListItemButton>
        <ListItemButton component={Link} to="/reviews">
          <ListItemText primary="Reviews" />
        </ListItemButton>
        {mode === 'MANAGEMENT' && (
          <ListItemButton component={Link} to="/admin/import/staging">
            <ListItemText primary="Import Staging" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );
}
