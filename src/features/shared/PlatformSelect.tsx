import { useState, useMemo, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  OutlinedInput,
  FormControl,
} from '@mui/material';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { createConsoleMap, createConsoleNameMap } from '../../referenceData/referenceDataUtils';

// Layout constants — fixed sizes for consistent layout (kept smaller to avoid horizontal scrollbar)
const FILTER_ROW_WIDTH = 280;
const CONSOLE_COLUMN_MIN = 140;
const CONSOLE_COLUMN_MAX = 200;
const PLATFORM_COLUMN_MIN = 160;
const PLATFORM_COLUMN_MAX = 220;
const DIALOG_MIN_WIDTH = CONSOLE_COLUMN_MIN + PLATFORM_COLUMN_MIN + 1; // + border
const DIALOG_MAX_WIDTH = CONSOLE_COLUMN_MAX + PLATFORM_COLUMN_MAX + 1;
const DIALOG_CONTENT_HEIGHT = 380;

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
  minWidth?: number | string;
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
  minWidth,
}: Props) {
  const { referenceData, isLoaded } = useReferenceData();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedConsoleUid, setSelectedConsoleUid] = useState<string | null>(null);
  const consoleListRef = useRef<HTMLDivElement>(null);

  const { platforms = [], consoles = [] } = referenceData?.data ?? {};

  // Smart defaults for minWidth based on fullWidth (minimum 300px)
  const defaultMinWidth = fullWidth ? 250 : 200;
  const effectiveMinWidth: number | string = minWidth 
    ? (typeof minWidth === 'number' ? Math.max(minWidth, 300) : minWidth)
    : Math.max(defaultMinWidth, 300);

  // Create console lookup maps for O(1) performance
  const consoleMap = useMemo(() => createConsoleMap(consoles), [consoles]);
  const consoleNameMap = useMemo(() => createConsoleNameMap(consoles), [consoles]);

  if (!isLoaded || !referenceData) {
    return (
      <FormControl fullWidth={fullWidth} size={size} sx={{ minWidth: fullWidth ? 0 : effectiveMinWidth }} disabled>
        <OutlinedInput aria-label={label} value="Loading…" readOnly endAdornment={<ArrowDropDown sx={{ color: 'action.disabled' }} />} />
      </FormControl>
    );
  }

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
          consoleNameMap.get(p.consoleUid)?.includes(lower)
      );
    }
    
    return result;
  }, [platforms, consoleNameMap, showAll, filterText]);

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
    const sortedConsoles = Array.from(byConsole.entries())
      .filter(([_, platformList]) => platformList.length > 0) // Hide consoles with no platforms after filtering
      .sort((a, b) => {
        const consoleA = consoleMap.get(a[0]);
        const consoleB = consoleMap.get(b[0]);
        const nameA = consoleA?.name ?? a[0];
        const nameB = consoleB?.name ?? b[0];
        return nameA.localeCompare(nameB);
      });
    
    return sortedConsoles.map(([consoleUid, platformList]) => ({
      consoleUid,
      consoleName: consoleMap.get(consoleUid)?.name ?? consoleUid,
      platforms: platformList.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [filteredPlatforms, consoleMap]);

  // Get platforms for the selected console
  const selectedConsolePlatforms = useMemo(() => {
    if (!selectedConsoleUid) return [];
    return grouped.find((g) => g.consoleUid === selectedConsoleUid)?.platforms ?? [];
  }, [grouped, selectedConsoleUid]);

  // Reset filter/console when value is cleared externally
  useEffect(() => {
    const isEmpty = multiple
      ? Array.isArray(value) && value.length === 0
      : !value || value === '';
    if (isEmpty) {
      setFilterText('');
      setSelectedConsoleUid(null);
    }
  }, [value, multiple]);

  const displayValue = (): string => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.length === 0) return '';
      return arr.map((uid) => platforms.find((p) => p.uid === uid)?.name ?? uid).join(', ');
    }
    if (!value || value === '') return '';
    const single = typeof value === 'string' ? value : '';
    return platforms.find((p) => p.uid === single)?.name ?? single;
  };

  const handleSelectPlatform = (platformUid: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? [...value] : [];
      const idx = arr.indexOf(platformUid);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(platformUid);
      onChange(arr);
    } else {
      onChange(platformUid);
      setOpen(false);
    }
  };

  const handleSelectEmpty = () => {
    if (!allowEmpty || multiple) return;
    onChange('');
    setOpen(false);
  };

  const isSelected = (platformUid: string) =>
    multiple
      ? Array.isArray(value) && value.includes(platformUid)
      : value === platformUid;

  return (
    <Box sx={{ width: fullWidth ? '100%' : undefined, minWidth: fullWidth ? 0 : effectiveMinWidth, maxWidth: fullWidth ? undefined : 520 }}>
      <FormControl fullWidth={fullWidth} required={required} size={size} sx={{ minWidth: 0 }}>
        <OutlinedInput
          id="platform-select-input"
          readOnly
          value={displayValue()}
          placeholder={label}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          endAdornment={<ArrowDropDown sx={{ color: 'action.active', pointerEvents: 'none' }} />}
          sx={{ cursor: 'pointer' }}
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
      </FormControl>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            minWidth: DIALOG_MIN_WIDTH,
            maxWidth: DIALOG_MAX_WIDTH,
            width: DIALOG_MIN_WIDTH,
            overflow: 'hidden',
          },
        }}
        aria-labelledby={`platform-dialog-${label}`}
      >
        <DialogTitle id={`platform-dialog-${label}`} component="div" sx={{ pt: 1.5, px: 1.5, pb: 0.5 }}>
          <Box sx={{ width: FILTER_ROW_WIDTH, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
              <TextField
                size="small"
                placeholder="Filter platforms..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                sx={{
                  width: 160,
                  flexShrink: 0,
                  '& .MuiInputBase-input': { py: 0.5 },
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: 1 } },
                }}
                autoFocus
              />
              <FormControlLabel
                control={<Checkbox checked={showAll} onChange={(e) => setShowAll(e.target.checked)} size="small" />}
                label={
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                    show hidden
                    <br />
                    platforms
                  </Typography>
                }
                sx={{ flexShrink: 0, m: 0 }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, px: 0, pb: 0, overflow: 'hidden', height: DIALOG_CONTENT_HEIGHT, boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', minWidth: 0 }}>
            {/* Left: console list — fixed min/max width */}
            <Box
              ref={consoleListRef}
              role="listbox"
              aria-label="Console selection"
              sx={{
                width: CONSOLE_COLUMN_MIN,
                minWidth: CONSOLE_COLUMN_MIN,
                maxWidth: CONSOLE_COLUMN_MAX,
                borderRight: 1,
                borderColor: 'divider',
                overflowY: 'auto',
                overflowX: 'hidden',
                bgcolor: 'background.default',
                flexShrink: 0,
              }}
              onKeyDown={(e) => {
                const items = consoleListRef.current?.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
                if (!items?.length) return;
                const currentIndex = Array.from(items).findIndex((el) => el.getAttribute('data-console-uid') === selectedConsoleUid);
                let next = currentIndex;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  next = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                } else if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (currentIndex >= 0) {
                    const uid = items[currentIndex].getAttribute('data-console-uid');
                    if (uid) setSelectedConsoleUid(uid);
                  }
                  return;
                } else return;
                if (next >= 0 && next < items.length) {
                  const uid = items[next].getAttribute('data-console-uid');
                  if (uid) {
                    setSelectedConsoleUid(uid);
                    (items[next] as HTMLElement).focus();
                  }
                }
              }}
            >
              {grouped.map(({ consoleUid, consoleName }) => (
                <Box
                  key={consoleUid}
                  role="option"
                  aria-selected={selectedConsoleUid === consoleUid}
                  data-console-uid={consoleUid}
                  tabIndex={selectedConsoleUid === consoleUid ? 0 : -1}
                  onClick={() => setSelectedConsoleUid(consoleUid)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    bgcolor: selectedConsoleUid === consoleUid ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '-2px' },
                  }}
                >
                  {consoleName}
                </Box>
              ))}
              {grouped.length === 0 && (
                <Box sx={{ px: 1.5, py: 1, fontSize: '0.875rem', color: 'text.secondary' }}>No consoles found</Box>
              )}
            </Box>

            {/* Right: platform list — fixed min/max width */}
            <Box
              sx={{
                minWidth: PLATFORM_COLUMN_MIN,
                maxWidth: PLATFORM_COLUMN_MAX,
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
              }}
            >
              {allowEmpty && !multiple && (
                <Box
                  component="button"
                  type="button"
                  onClick={handleSelectEmpty}
                  sx={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    px: 1.5,
                    py: 1,
                    border: 0,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    bgcolor: 'transparent',
                    color: 'text.primary',
                    fontStyle: 'italic',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {emptyLabel}
                </Box>
              )}
              {selectedConsoleUid && selectedConsolePlatforms.length > 0 ? (
                selectedConsolePlatforms.map((p) => (
                  <Box
                    key={p.uid}
                    component="button"
                    type="button"
                    onClick={() => handleSelectPlatform(p.uid)}
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      px: 1.5,
                      py: 1,
                      border: 0,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      bgcolor: isSelected(p.uid) ? 'action.selected' : 'transparent',
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {p.name}
                  </Box>
                ))
              ) : selectedConsoleUid ? (
                <Box sx={{ px: 1.5, py: 1, fontSize: '0.875rem', color: 'text.secondary' }}>No platforms found</Box>
              ) : (
                <Box sx={{ px: 1.5, py: 1, fontSize: '0.875rem', color: 'text.secondary' }}>Select a console</Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
