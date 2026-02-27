import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount =
    (value.consoleUids.length > 0 ? 1 : 0) +
    (value.platformUids.length > 0 ? 1 : 0) +
    (value.completionStateUids.length > 0 ? 1 : 0) +
    (value.playthroughTypeUids.length > 0 ? 1 : 0) +
    (value.includeDlc === false ? 1 : 0) +
    (value.onlyGamesWithDlc !== null ? 1 : 0);

  const headerRow = (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: isMobile ? 1 : 0 }}
    >
      <TextField
        label="Search"
        placeholder="Search by Name"
        value={value.searchText}
        onChange={(e) =>
          onChange({ ...value, searchText: e.target.value })
        }
        size="small"
        sx={{
          minWidth: 160,
          ...(isMobile ? { flex: 1 } : { maxWidth: 280 }),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 140 }}>
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

      {isMobile && (
        <Button
          variant={filtersOpen ? 'outlined' : 'text'}
          size="small"
          startIcon={filtersOpen ? <ExpandLessIcon /> : <FilterListIcon />}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
          {activeCount > 0 && ` (${activeCount})`}
        </Button>
      )}
    </Stack>
  );

  const filterFields = (
    <Stack
      direction="row"
      spacing={2}
      flexWrap="wrap"
      useFlexGap
      alignItems="center"
      sx={
        isMobile
          ? {
              mt: 1,
              '& > *': { minWidth: 0, flex: '1 1 160px' },
            }
          : {}
      }
    >
      <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 160 }}>
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

      <Box sx={{ minWidth: isMobile ? 0 : 160 }}>
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
          fullWidth={isMobile}
        />
      </Box>

      <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 180 }}>
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

      <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 200 }}>
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

      <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 200 }}>
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
    </Stack>
  );

  return (
    <Stack spacing={0} mb={3}>
      {headerRow}
      {isMobile ? (
        <Collapse in={filtersOpen}>{filterFields}</Collapse>
      ) : (
        filterFields
      )}
    </Stack>
  );
}
  