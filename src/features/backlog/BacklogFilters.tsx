import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormControlLabel,
  Checkbox,
  Stack,
  TextField,
  MenuItem,
  InputLabel,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { compactBlurredFilterPanelSx } from '../yearlyReview/yearlyReviewPanelStyles';
import type { BacklogFilterState } from './types';

interface Props {
  value: BacklogFilterState;
  onChange: (next: BacklogFilterState) => void;
}

export default function BacklogFilters({ value, onChange }: Props) {
  const { referenceData, isLoaded } = useReferenceData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTextDraft, setSearchTextDraft] = useState(value.searchText);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    setSearchTextDraft(value.searchText);
  }, [value.searchText]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  if (!isLoaded || !referenceData) return null;

  const { consoles, completionStates } = referenceData.data;
  const activeCount =
    (value.consoleUids.length > 0 ? 1 : 0) +
    (value.platformUids.length > 0 ? 1 : 0) +
    (value.hasActivePlaythrough !== null ? 1 : 0) +
    (value.completionStateUids.length > 0 ? 1 : 0);

  const handleCompletionChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    onChange({
      ...value,
      completionStateUids: Array.isArray(v) ? v : v ? [v] : [],
    });
  };

  const headerRow = (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: isMobile ? 1 : 0 }}
    >
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
    <Stack spacing={1.25} sx={{ mt: 1 }}>
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        justifyContent="center"
        sx={isMobile ? { '& > *': { minWidth: 0, flex: '1 1 160px' } } : {}}
      >
        <TextField
          label="Search"
          placeholder="Search by Name"
          value={searchTextDraft}
          onChange={(e) => {
            const next = e.target.value;
            setSearchTextDraft(next);
            if (searchDebounceRef.current) {
              clearTimeout(searchDebounceRef.current);
            }
            searchDebounceRef.current = setTimeout(() => {
              onChange({ ...valueRef.current, searchText: next });
            }, 250);
          }}
          size="small"
          sx={{
            minWidth: 160,
            ...(isMobile ? { flex: 1 } : { maxWidth: 280 }),
          }}
        />

        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 160 }}>
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

        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 180 }}>
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
    </Stack>
  );

  return (
    <Box sx={{ ...compactBlurredFilterPanelSx, mb: 3 }}>
      <Stack spacing={0}>
        {headerRow}
        {isMobile ? (
          <Collapse in={filtersOpen}>{filterFields}</Collapse>
        ) : (
          filterFields
        )}
      </Stack>
    </Box>
  );
}
