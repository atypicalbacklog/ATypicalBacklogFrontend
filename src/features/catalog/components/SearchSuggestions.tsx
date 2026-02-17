import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import SmartImage from '../../shared/SmartImage';

export interface SearchResultItem {
  id: string;
  name: string;
  coverImageUid: string | null;
  subtitle?: string;
}

interface Props {
  results: SearchResultItem[];
  onSelect: (item: SearchResultItem) => void;
  emptyMessage?: string;
}

export default function SearchSuggestions({
  results,
  onSelect,
  emptyMessage = 'No results',
}: Props) {
  if (results.length === 0) return null;

  return (
    <Box sx={{ mt: 1, border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 240, overflow: 'auto' }}>
      <List dense disablePadding>
        {results.map((item) => {
          return (
            <ListItemButton key={item.id} onClick={() => onSelect(item)}>
              <SmartImage
                imageUid={item.coverImageUid}
                thumbnail
                alt=""
                aspectRatio={2 / 3}
                fit="contain"
                sx={{ width: 40, height: 40, borderRadius: 0.5, mr: 1.5 }}
                imgSx={{ borderRadius: 0.5 }}
              />
              <ListItemText
                primary={item.name}
                secondary={item.subtitle}
                primaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
