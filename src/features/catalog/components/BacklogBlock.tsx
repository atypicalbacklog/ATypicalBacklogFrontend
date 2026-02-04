import { FormControlLabel, Checkbox, Stack, TextField } from '@mui/material';
import DateField from './DateField';

interface Props {
  addToBacklog: boolean;
  onAddToBacklogChange: (v: boolean) => void;
  addedDate: string;
  onAddedDateChange: (v: string) => void;
  reason: string;
  onReasonChange: (v: string) => void;
}

export default function BacklogBlock({
  addToBacklog,
  onAddToBacklogChange,
  addedDate,
  onAddedDateChange,
  reason,
  onReasonChange,
}: Props) {
  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Checkbox
            checked={addToBacklog}
            onChange={(e) => onAddToBacklogChange(e.target.checked)}
          />
        }
        label="Add to Backlog"
      />
      {addToBacklog && (
        <Stack spacing={2} sx={{ pl: 2 }}>
          <DateField
            label="Added date"
            value={addedDate}
            onChange={onAddedDateChange}
            required
          />
          <TextField
            label="Reason (optional)"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
          />
        </Stack>
      )}
    </Stack>
  );
}
