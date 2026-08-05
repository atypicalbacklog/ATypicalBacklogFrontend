import { useEffect, useRef, useState } from 'react';
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
import { isManagementMode } from '../../app/AppConfig';
import { CompletionFilterIntent, LibraryFilterState } from './types';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import PlatformSelect from '../shared/PlatformSelect';
import { compactBlurredFilterPanelSx } from '../yearlyReview/yearlyReviewPanelStyles';

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
  const [searchTextDraft, setSearchTextDraft] = useState(value.searchText);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Sync draft from committed filter only when not mid-debounce typing.
  useEffect(() => {
    if (searchDebounceRef.current) return;
    setSearchTextDraft(value.searchText);
  }, [value.searchText]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const showIncludeDlc = isManagementMode();

  const activeCount =
    (value.consoleUids.length > 0 ? 1 : 0) +
    (value.platformUids.length > 0 ? 1 : 0) +
    (value.completionStateUids.length > 0 ? 1 : 0) +
    (value.playthroughTypeUids.length > 0 ? 1 : 0) +
    (showIncludeDlc && value.includeDlc === false ? 1 : 0) +
    (value.onlyGamesWithDlc !== null ? 1 : 0);

  const intentOptions: Array<{ value: CompletionFilterIntent; label: string }> = [
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FINISHED', label: 'Finished' },
    { value: 'PLAYING', label: 'Playing' },
    { value: 'PLAYED', label: 'Played' },
    { value: 'BACKLOG', label: 'Backlog' },
    { value: 'UNPLAYED', label: 'Unplayed' },
  ];

  const completionStatesByIntent: Record<CompletionFilterIntent, string[]> = {
    COMPLETED: ['Completed'],
    FINISHED: ['Completed', 'FinishedPlus', 'Finished'],
    PLAYING: ['InProgress', 'Started'],
    PLAYED: ['Completed', 'FinishedPlus', 'Finished', 'Postponed', 'Abandoned'],
    BACKLOG: ['Postponed', 'Backlog'],
    UNPLAYED: ['None', 'Cancelled'],
  };

  const normalizeStateName = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, '');

  const resolveCompletionStateUidsFromIntents = (intents: CompletionFilterIntent[]) => {
    const targetNames = new Set(
      intents.flatMap((intent) =>
        completionStatesByIntent[intent].map(normalizeStateName)
      )
    );
    return completionStates
      .filter((c) => targetNames.has(normalizeStateName(c.name)))
      .map((c) => c.uid);
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

  const filterDivider = (
    <Box
      aria-hidden
      className="library-filter-divider"
      sx={{
        display: { xs: 'none', sm: 'block' },
        alignSelf: 'center',
        flex: '0 0 auto',
        color: 'text.disabled',
        typography: 'body2',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      |
    </Box>
  );

  const filterFieldSx = isMobile ? { minWidth: 0, flex: '1 1 160px' } : undefined;

  const filterRowSx = {
    width: 'fit-content',
    maxWidth: '100%',
  };

  const filterFields = (
    <Stack spacing={2} sx={{ mt: 1, width: 'fit-content', maxWidth: '100%' }}>
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        sx={filterRowSx}
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
            ...(isMobile ? filterFieldSx : { maxWidth: 280 }),
          }}
        />
        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 200, ...filterFieldSx }}>
          <InputLabel>Filter Played</InputLabel>
          <Select
            multiple
            value={value.completionFilterIntents}
            onChange={(e: SelectChangeEvent<CompletionFilterIntent[]>) => {
              const v = e.target.value;
              const intents = (Array.isArray(v) ? v : v ? [v] : []) as CompletionFilterIntent[];
              const completionStateUids = resolveCompletionStateUidsFromIntents(intents);
              onChange({
                ...value,
                completionFilterIntents: intents,
                completionStateUids,
              });
            }}
            input={<OutlinedInput label="Filter Played" />}
            renderValue={(selected) =>
              selected
                .map((intent) => intentOptions.find((o) => o.value === intent)?.label ?? intent)
                .join(', ')
            }
          >
            {intentOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 200, ...filterFieldSx }}>
          <InputLabel>Filter Playtype</InputLabel>
          <Select
            label="Filter Playtype"
            multiple
            value={value.playthroughTypeUids}
            onChange={(e: SelectChangeEvent<string[]>) => {
              const selected = (e.target.value as string[]) ?? [];
              const NONE_VALUE = '__none__';
              const playthroughTypeUids = selected.includes(NONE_VALUE)
                ? []
                : selected.filter((uid) => uid !== NONE_VALUE);
              onChange({
                ...value,
                playthroughTypeUids,
              });
            }}
            renderValue={(selected) =>
              selected.length === 0
                ? 'None'
                : selected
                    .map(
                      (uid) =>
                        playthroughTypes.find((t) => t.uid === uid)?.name ?? uid
                    )
                    .join(', ')
            }
          >
            <MenuItem value="__none__">None</MenuItem>
            {playthroughTypes.map((t) => (
              <MenuItem key={t.uid} value={t.uid}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        sx={filterRowSx}
      >
        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 160, ...filterFieldSx }}>
          <InputLabel>Original Console</InputLabel>
          <Select
            label="Original Console"
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
        <FormControlLabel
          sx={filterFieldSx}
          control={
            <Checkbox
              checked={value.ignorePorts}
              onChange={(e) =>
                onChange({ ...value, ignorePorts: e.target.checked })
              }
            />
          }
          label="Ignore Ports"
        />

        <Box sx={{ width: isMobile ? '100%' : 240, minWidth: isMobile ? 0 : 160, ...filterFieldSx }}>
          <PlatformSelect
            value={value.platformUids[0] ?? ''}
            onChange={(v) =>
              onChange({
                ...value,
                platformUids: typeof v === 'string' ? (v ? [v] : []) : v,
              })
            }
            label="Filter by Specific Platform"
            allowEmpty
            emptyLabel="All"
            size="small"
            fullWidth
          />
        </Box>

        {filterDivider}

        {showIncludeDlc ? (
          <FormControlLabel
            sx={filterFieldSx}
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
        ) : null}

        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 200, ...filterFieldSx }}>
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
  