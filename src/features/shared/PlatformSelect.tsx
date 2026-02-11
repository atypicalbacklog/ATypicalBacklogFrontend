import { useState, useMemo, useRef, useEffect } from 'react';
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
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useReferenceData } from '../../referenceData/ReferenceDataContext';
import { createConsoleMap, createConsoleNameMap } from '../../referenceData/referenceDataUtils';

// Layout constants
const LIST_SUBHEADER_HEIGHT = 57;
const CONSOLE_COLUMN_WIDTH = '50%';
const PLATFORM_COLUMN_WIDTH = 'calc(50% - 16px)';
const FILTER_TEXTFIELD_MIN_WIDTH = 160;
const FILTER_TEXTFIELD_MAX_WIDTH = 250;
const COLUMN_MIN_WIDTH = 120; // Minimum width per column (console/platform)

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
  const selectRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
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
      <FormControl 
        fullWidth={fullWidth} 
        size={size} 
        sx={{ 
          minWidth: effectiveMinWidth,
          maxWidth: 400,
        }} 
        disabled
      >
        <InputLabel>{label}</InputLabel>
        <Select label={label} value={multiple ? [] : ''} renderValue={() => 'Loading…'}>
          <MenuItem value="">Loading…</MenuItem>
        </Select>
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

  // Reset internal state when value is cleared externally
  useEffect(() => {
    const isEmpty = multiple 
      ? (Array.isArray(value) && value.length === 0)
      : (!value || value === '');
    
    if (isEmpty) {
      setFilterText('');
      setSelectedConsoleUid(null);
    }
  }, [value, multiple]);

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    const value = e.target.value;
    if (value !== undefined && value !== null) {
      onChange(value);
    }
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


  // Calculate menu width and handle resize
  useEffect(() => {
    const updateWidth = () => {
      if (selectRef.current) {
        const width = selectRef.current.offsetWidth;
        setMenuWidth(width);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value && value !== '';

  // Consolidated clear value logic
  const clearValue = () => {
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearValue();
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterText('');
    setSelectedConsoleUid(null);
    clearValue();
  };

  return (
    <Box ref={selectRef} sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
      {!multiple && hasValue && allowEmpty && (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            padding: 0.5,
          }}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
      <FormControl
        fullWidth={fullWidth}
        required={required}
        size={size}
        sx={{ 
          minWidth: effectiveMinWidth,
          maxWidth: 400,
        }}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          value={value}
          onChange={handleChange}
          multiple={multiple}
          input={
            multiple ? (
              <OutlinedInput
                label={label}
                endAdornment={
                  hasValue && allowEmpty ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClear}
                        edge="end"
                        sx={{ mr: -1 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined
                }
              />
            ) : undefined
          }
          renderValue={renderValue}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          PaperProps: {
            sx: {
              maxHeight: 400,
              minWidth: menuWidth ? `${menuWidth}px` : undefined,
              width: menuWidth ? `${menuWidth}px` : undefined,
              position: 'relative',
              overflow: 'hidden',
            },
          },
          MenuListProps: {
            sx: {
              padding: 0,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 400,
              position: 'relative',
              minHeight: 350,
            },
          },
        }}
      >
        {allowEmpty && !multiple && (
          <MenuItem value="">
            <em>{emptyLabel}</em>
          </MenuItem>
        )}
        
        {/* Filter controls — ListSubheader so Select still sees MenuItems as siblings */}
        <ListSubheader
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            backgroundColor: 'rgba(50, 50, 50, 1)',
            zIndex: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              placeholder="Filter platforms..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ 
                minWidth: `${FILTER_TEXTFIELD_MIN_WIDTH}px`,
                maxWidth: `${FILTER_TEXTFIELD_MAX_WIDTH}px`,
                flex: 1,
                flexShrink: 1,
              }}
              InputProps={{
                endAdornment: (filterText || hasValue || selectedConsoleUid) ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                      aria-label="clear"
                      title="clear"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                  show unused
                  <br />
                  platforms
                </Typography>
              }
              sx={{ flexShrink: 0, m: 0 }}
            />
          </Box>
        </ListSubheader>

        {/* Two-column layout container - positioned absolutely to not interfere with MenuItems */}
        <Box
          component="div"
          ref={consoleListRef}
          role="listbox"
          aria-label="Console selection"
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: CONSOLE_COLUMN_WIDTH,
            minWidth: `${COLUMN_MIN_WIDTH}px`,
            borderRight: 1,
            borderColor: 'divider',
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: 'background.default',
            zIndex: 1,
            pointerEvents: 'auto',
            paddingTop: `${LIST_SUBHEADER_HEIGHT}px`,
            // Hide scrollbar
            msOverflowStyle: 'none', // IE and Edge
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome, Safari, Opera
            },
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            // Keyboard navigation for console selection
            const consoleItems = consoleListRef.current?.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
            if (!consoleItems || consoleItems.length === 0) return;

            const currentIndex = Array.from(consoleItems).findIndex(
              (item) => item.getAttribute('data-console-uid') === selectedConsoleUid
            );

            let nextIndex = currentIndex;

            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                nextIndex = currentIndex < consoleItems.length - 1 ? currentIndex + 1 : 0;
                break;
              case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : consoleItems.length - 1;
                break;
              case 'Enter':
              case ' ':
                e.preventDefault();
                e.stopPropagation();
                if (currentIndex >= 0) {
                  const uid = consoleItems[currentIndex].getAttribute('data-console-uid');
                  if (uid) setSelectedConsoleUid(uid);
                }
                return;
              default:
                return;
            }

            if (nextIndex >= 0 && nextIndex < consoleItems.length) {
              const uid = consoleItems[nextIndex].getAttribute('data-console-uid');
              if (uid) {
                setSelectedConsoleUid(uid);
                consoleItems[nextIndex].focus();
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
              onClick={(e) => {
                e.stopPropagation();
                setSelectedConsoleUid(consoleUid);
              }}
              sx={{
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.875rem',
                bgcolor: selectedConsoleUid === consoleUid ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&:focus': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '-2px',
                },
              }}
            >
              {consoleName}
            </Box>
          ))}
          {grouped.length === 0 && (
            <Box 
              role="status"
              aria-live="polite"
              sx={{ px: 1.5, py: 1, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              No consoles found
            </Box>
          )}
        </Box>

        {/* Platforms - MenuItems as direct children, positioned on the right */}
        {selectedConsoleUid && selectedConsolePlatforms.length > 0 ? (
          selectedConsolePlatforms.map((p) => (
            <MenuItem
              key={p.uid}
              value={p.uid}
              sx={{
                fontSize: '0.875rem',
                ml: CONSOLE_COLUMN_WIDTH,
                width: PLATFORM_COLUMN_WIDTH,
                minWidth: `${COLUMN_MIN_WIDTH}px`,
              }}
            >
              {p.name}
            </MenuItem>
          ))
        ) : selectedConsoleUid ? (
          <Box
            component="div"
            role="status"
            aria-live="polite"
            sx={{
              ml: CONSOLE_COLUMN_WIDTH,
              width: PLATFORM_COLUMN_WIDTH,
              minWidth: `${COLUMN_MIN_WIDTH}px`,
              px: 1.5,
              py: 1,
              fontSize: '0.875rem',
              color: 'text.secondary',
              pointerEvents: 'none',
            }}
          >
            No platforms found
          </Box>
        ) : (
          <Box
            component="div"
            role="status"
            aria-live="polite"
            sx={{
              ml: CONSOLE_COLUMN_WIDTH,
              width: PLATFORM_COLUMN_WIDTH,
              minWidth: `${COLUMN_MIN_WIDTH}px`,
              px: 1.5,
              py: 1,
              fontSize: '0.875rem',
              color: 'text.secondary',
              pointerEvents: 'none',
            }}
          >
            Select a console
          </Box>
        )}
      </Select>
    </FormControl>
    </Box>
  );
}
