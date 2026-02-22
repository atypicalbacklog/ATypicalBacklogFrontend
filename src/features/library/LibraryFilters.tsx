import {
  Box,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import { LibraryFilterState, SortMode } from './types';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import PlatformSelect from '../shared/PlatformSelect';

interface Props {
  value: LibraryFilterState;
  onChange: (next: LibraryFilterState) => void;
}

export default function LibraryFilters({ value, onChange }: Props) {
  const { referenceData, isLoaded } = useReferenceData();
  if (!isLoaded || !referenceData) return null;

  const { consoles, completionStates, playthroughTypes } =
    referenceData.data;

  return (
    <Stack spacing={2} mb={3}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap">
        <TextField
          label="Search"
          placeholder="Search by Name"
          value={value.searchText}
          onChange={(e) =>
            onChange({ ...value, searchText: e.target.value })
          }
          size="small"
          sx={{ minWidth: 180, flexShrink: 0 }}
        />
        <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
          <InputLabel>Console</InputLabel>
          <Select
            label="Console"
            value={value.consoleUids[0] ?? ''}
            onChange={(e) => {
              const v = e.target.value as string;
              onChange({
                ...value,
                consoleUids: v ? [v] : [],
              });
            }}
          >
            <MenuItem value="">All</MenuItem>
            {consoles.map((c) => (
              <MenuItem key={c.uid} value={c.uid}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flexShrink: 0 }}>
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
            size="small"
            fullWidth={false}
          />
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Completion</InputLabel>
        <Select
          multiple
          value={value.completionStateUids}
          onChange={(e: SelectChangeEvent<string[]>) => {
            const v = e.target.value;
            onChange({
              ...value,
              completionStateUids: Array.isArray(v) ? v : v ? [v] : [],
            });
          }}
          input={<OutlinedInput label="Completion" />}
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

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Playthrough type</InputLabel>
        <Select
          label="Playthrough type"
          multiple
          value={value.playthroughTypeUids}
          onChange={(e) =>
            onChange({
              ...value,
              playthroughTypeUids: e.target.value as string[],
            })
          }
          renderValue={(selected) =>
            selected.length === 0
              ? 'All'
              : selected
                  .map(
                    (uid) =>
                      playthroughTypes.find((t) => t.uid === uid)?.name ?? uid
                  )
                  .join(', ')
          }
        >
          {playthroughTypes.map((t) => (
            <MenuItem key={t.uid} value={t.uid}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={value.includeDlc !== false}
            onChange={(e) =>
              onChange({ ...value, includeDlc: e.target.checked })
            }
          />
        }
        label="Include DLC"
      />

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Limit DLC Games</InputLabel>
        <Select
          label="Limit DLC Games"
          value={
            value.onlyGamesWithDlc === null
              ? ''
              : value.onlyGamesWithDlc
                ? 'true'
                : 'false'
          }
          onChange={(e) =>
            onChange({
              ...value,
              onlyGamesWithDlc:
                e.target.value === ''
                  ? null
                  : e.target.value === 'true',
            })
          }
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">with DLC</MenuItem>
          <MenuItem value="false">without DLC</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140, ml: 2 }}>
        <InputLabel>Sort</InputLabel>
        <Select
          label="Sort"
          value={value.sortMode}
          onChange={(e) =>
            onChange({
              ...value,
              sortMode: e.target.value as SortMode,
            })
          }
        >
          <MenuItem value="NAME_ASC">Name ↑</MenuItem>
          <MenuItem value="NAME_DESC">Name ↓</MenuItem>
          <MenuItem value="PLAYTIME_DESC">Playtime</MenuItem>
          <MenuItem value="LAST_PLAYED_DESC">Last Played</MenuItem>
          <MenuItem value="NEWEST_CREATED">Newest created</MenuItem>
          <MenuItem value="RELEASE_DATE">Release date</MenuItem>
        </Select>
      </FormControl>
      </Stack>
    </Stack>
  );
}
  