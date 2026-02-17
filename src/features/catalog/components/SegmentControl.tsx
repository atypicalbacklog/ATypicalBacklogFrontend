import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { CatalogMode } from '../types';

interface Props {
  value: CatalogMode;
  onChange: (mode: CatalogMode) => void;
}

export default function SegmentControl({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, v) => v != null && onChange(v)}
      aria-label="Add Game, Instance, or DLC"
      sx={{ mb: 3 }}
    >
      <ToggleButton
        value="game"
        aria-label="Add New Game"
        sx={(theme) => ({
          bgcolor:
            value === 'game'
              ? theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200]
              : theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
          opacity: 1,
          '&.Mui-selected': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            opacity: 1,
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[200],
              opacity: 1,
            },
          },
          '&:hover': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            opacity: 1,
          },
        })}
      >
        Add New Game
      </ToggleButton>
      <ToggleButton
        value="instance"
        aria-label="Add New Instance"
        sx={(theme) => ({
          bgcolor:
            value === 'instance'
              ? theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200]
              : theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
          opacity: 1,
          '&.Mui-selected': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            opacity: 1,
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[200],
              opacity: 1,
            },
          },
          '&:hover': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            opacity: 1,
          },
        })}
      >
        Add New Instance
      </ToggleButton>
      <ToggleButton
        value="dlc"
        aria-label="Add New DLC"
        sx={(theme) => ({
          bgcolor:
            value === 'dlc'
              ? theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200]
              : theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
          opacity: 1,
          '&.Mui-selected': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            opacity: 1,
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[200],
              opacity: 1,
            },
          },
          '&:hover': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            opacity: 1,
          },
        })}
      >
        Add New DLC
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
