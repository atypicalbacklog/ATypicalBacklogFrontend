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
      <ToggleButton value="game" aria-label="Add New Game">
        Add New Game
      </ToggleButton>
      <ToggleButton value="instance" aria-label="Add New Instance">
        Add New Instance
      </ToggleButton>
      <ToggleButton value="dlc" aria-label="Add New DLC">
        Add New DLC
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
