import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';

const THUMBNAIL_BASE = '/api/thumbnails';

export interface SearchResultItem {
  id: string;
  name: string;
  thumbnailImageUid: string | null;
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
        {results.map((item) => (
          <ListItemButton key={item.id} onClick={() => onSelect(item)}>
            {item.thumbnailImageUid ? (
              <Box
                component="img"
                src={`${THUMBNAIL_BASE}/${item.thumbnailImageUid}`}
                alt=""
                sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 0.5, mr: 1.5 }}
              />
            ) : (
              <Box sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: 0.5, mr: 1.5 }} />
            )}
            <ListItemText
              primary={item.name}
              secondary={item.subtitle}
              primaryTypographyProps={{ noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
