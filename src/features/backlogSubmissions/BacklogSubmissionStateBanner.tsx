import { Stack, Typography } from '@mui/material';
import DateWithIcon from '../shared/DateWithIcon';
import SubmissionStateBorderFrame from './backlogSubmissionBorderFrame';
import type { BacklogSubmissionStateBorder } from './backlogSubmissionStateLabels';

interface Props {
  message: string;
  border: Exclude<BacklogSubmissionStateBorder, 'none'>;
  stateDate: string | null;
}

function BannerContent({ message, stateDate }: Pick<Props, 'message' | 'stateDate'>) {
  return (
    <Stack spacing={0.75} sx={{ p: 1.5 }}>
      <Typography variant="body2">{message}</Typography>
      {stateDate ? (
        <DateWithIcon
          date={stateDate}
          tooltip="Last changed by atypicalbacklog"
          variant="caption"
        />
      ) : null}
    </Stack>
  );
}

export default function BacklogSubmissionStateBanner({ message, border, stateDate }: Props) {
  return (
    <SubmissionStateBorderFrame border={border} tinted>
      <BannerContent message={message} stateDate={stateDate} />
    </SubmissionStateBorderFrame>
  );
}
