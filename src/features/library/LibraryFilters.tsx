import {
    Box,
    MenuItem,
    Stack,
    TextField,
  } from '@mui/material';
  import { LibraryFilterState } from './types';
  import { useReferenceData } from '../../referenceData/ReferenceDataContext';
  import PlatformSelect from '../shared/PlatformSelect';
  
  interface Props {
    value: LibraryFilterState;
    onChange: (next: LibraryFilterState) => void;
  }
  
  export default function LibraryFilters({ value, onChange }: Props) {
    const { referenceData, isLoaded } = useReferenceData();
    if (!isLoaded || !referenceData) return null;
  
    const { platforms, consoles, completionStates } = referenceData.data;
  
    return (
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search"
          value={value.searchText}
          onChange={(e) =>
            onChange({ ...value, searchText: e.target.value })
          }
        />
  
        <PlatformSelect
          value={value.platformUids[0] ?? ''}
          onChange={(v) =>
            onChange({
              ...value,
              platformUids: typeof v === 'string' ? (v ? [v] : []) : v,
            })
          }
          label="Platform"
          allowEmpty
          emptyLabel="All"
        />
  
        <TextField
          select
          label="Completion"
          value={value.completionStateUids[0] ?? ''}
          onChange={(e) =>
            onChange({ ...value, completionStateUids: [e.target.value] })
          }
        >
          {completionStates.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
  
        <TextField
          select
          label="Sort"
          value={value.sortMode}
          onChange={(e) =>
            onChange({ ...value, sortMode: e.target.value as any })
          }
        >
          <MenuItem value="NAME_ASC">Name ↑</MenuItem>
          <MenuItem value="NAME_DESC">Name ↓</MenuItem>
          <MenuItem value="PLAYTIME_DESC">Playtime</MenuItem>
          <MenuItem value="LAST_PLAYED_DESC">Last Played</MenuItem>
        </TextField>
      </Stack>
    );
  }
  