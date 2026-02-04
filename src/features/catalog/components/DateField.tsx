import { TextField } from '@mui/material';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function DateField({
  label,
  value,
  onChange,
  required = false,
}: Props) {
  return (
    <TextField
      type="date"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      required={required}
      size="small"
      sx={{ width: 160, maxWidth: '100%' }}
    />
  );
}
