import { useState, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  ListSubheader,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';

interface Props {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

/**
 * Platform selection component with:
 * - Filtering by hideInChoices (shows only where hideInChoices = false)
 * - Grouping by console
 * - "Show all" option to include hidden platforms
 * - Text filter to search platforms
 */
export default function PlatformSelect({
  value,
  onChange,
  label = 'Platform',
  required = false,
  multiple = false,
  allowEmpty = false,
  emptyLabel = '—',
  size = 'medium',
  fullWidth = true,
}: Props) {
  const { referenceData, isLoaded } = useReferenceData();
  const [showAll, setShowAll] = useState(false);
  const [filterText, setFilterText] = useState('');

  const { platforms = [], consoles = [] } = referenceData?.data ?? {};

  // Filter platforms: by default exclude hideInChoices=true, unless "show all" is checked
  const filteredPlatforms = useMemo(() => {
    let result = showAll
      ? platforms
      : platforms.filter((p) => !p.hideInChoices);
    
    if (filterText.trim()) {
      const lower = filterText.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          consoles.find((c) => c.uid === p.consoleUid)?.name.toLowerCase().includes(lower)
      );
    }
    
    return result;
  }, [platforms, consoles, showAll, filterText]);

  // Group by console
  const grouped = useMemo(() => {
    const byConsole = new Map<string, typeof filteredPlatforms>();
    filteredPlatforms.forEach((p) => {
      const consoleUid = p.consoleUid;
      if (!byConsole.has(consoleUid)) {
        byConsole.set(consoleUid, []);
      }
      byConsole.get(consoleUid)!.push(p);
    });
    
    // Sort consoles by name, then platforms within each console
    const sortedConsoles = Array.from(byConsole.entries()).sort((a, b) => {
      const consoleA = consoles.find((c) => c.uid === a[0]);
      const consoleB = consoles.find((c) => c.uid === b[0]);
      const nameA = consoleA?.name ?? a[0];
      const nameB = consoleB?.name ?? b[0];
      return nameA.localeCompare(nameB);
    });
    
    return sortedConsoles.map(([consoleUid, platformList]) => ({
      consoleUid,
      consoleName: consoles.find((c) => c.uid === consoleUid)?.name ?? consoleUid,
      platforms: platformList.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [filteredPlatforms, consoles]);

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    onChange(e.target.value);
  };

  const renderValue = (selected: string | string[]) => {
    if (multiple) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      if (selectedArray.length === 0) return '';
      return selectedArray
        .map((uid) => platforms.find((p) => p.uid === uid)?.name ?? uid)
        .join(', ');
    }
    if (!selected || selected === '') return '';
    return platforms.find((p) => p.uid === selected)?.name ?? selected;
  };

  if (!isLoaded || !referenceData) {
    return (
      <FormControl fullWidth={fullWidth} size={size} sx={!fullWidth ? { minWidth: 160 } : undefined} disabled>
        <InputLabel>{label}</InputLabel>
        <Select label={label} value={multiple ? [] : ''} renderValue={() => 'Loading…'}>
          <MenuItem value="">Loading…</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl
      fullWidth={fullWidth}
      required={required}
      size={size}
      sx={!fullWidth ? { minWidth: 160 } : undefined}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        input={multiple ? <OutlinedInput label={label} /> : undefined}
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 400 },
          },
        }}
      >
        {allowEmpty && !multiple && (
          <MenuItem value="">
            <em>{emptyLabel}</em>
          </MenuItem>
        )}
        
        {/* Filter controls — ListSubheader so Select still sees MenuItems as siblings */}
        <ListSubheader sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            component="span"
            sx={{ display: 'block', py: 1 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              placeholder="Filter platforms..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  size="small"
                />
              }
              label="Show all"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </ListSubheader>

        {/* Grouped platforms — MenuItems must be direct children of Select for selection to work */}
        {grouped.flatMap(({ consoleUid, consoleName, platforms: consolePlatforms }) => [
          <ListSubheader key={`${consoleUid}-sub`}>{consoleName}</ListSubheader>,
          ...consolePlatforms.map((p) => (
            <MenuItem key={p.uid} value={p.uid}>
              {p.name}
            </MenuItem>
          )),
        ])}
        
        {grouped.length === 0 && (
          <MenuItem disabled>No platforms found</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
