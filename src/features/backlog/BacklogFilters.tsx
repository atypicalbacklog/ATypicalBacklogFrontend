import {
  FormControlLabel,
  Checkbox,
  Stack,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import type { BacklogFilterState } from './types';

interface Props {
  value: BacklogFilterState;
  onChange: (next: BacklogFilterState) => void;
}

export default function BacklogFilters({ value, onChange }: Props) {
  const { referenceData, isLoaded } = useReferenceData();
  if (!isLoaded || !referenceData) return null;

  const { consoles, completionStates } = referenceData.data;

  const handleCompletionChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    onChange({
      ...value,
      completionStateUids: Array.isArray(v) ? v : v ? [v] : [],
    });
  };

  return (
    <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" alignItems="center">
      <TextField
        label="Search"
        value={value.searchText}
        onChange={(e) => onChange({ ...value, searchText: e.target.value })}
        size="small"
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Consoles</InputLabel>
        <Select
          multiple
          value={value.consoleUids}
          onChange={(e) =>
            onChange({
              ...value,
              consoleUids: e.target.value as string[],
            })
          }
          input={<OutlinedInput label="Consoles" />}
          renderValue={(selected) =>
            selected
              .map((uid) => consoles.find((c) => c.uid === uid)?.name ?? uid)
              .join(', ')
          }
        >
          {consoles.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={value.hasActivePlaythrough === true}
            onChange={(_, checked) =>
              onChange({
                ...value,
                hasActivePlaythrough: checked ? true : null,
              })
            }
          />
        }
        label="Playthrough active"
      />

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Completion state</InputLabel>
        <Select
          multiple
          value={value.completionStateUids}
          onChange={handleCompletionChange}
          input={<OutlinedInput label="Completion state" />}
          renderValue={(selected) =>
            selected
              .map(
                (uid) =>
                  completionStates.find((c) => c.uid === uid)?.name ?? uid
              )
              .join(', ')
          }
        >
          {completionStates.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
