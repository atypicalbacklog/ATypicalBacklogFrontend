import { Box, Typography } from '@mui/material';
import type { BacklogRecommendationViewDto } from '../../types/backlogRecommendationDto';
import BacklogSubmissionCard from './BacklogSubmissionCard';
import { recommendationCoverUid } from './recommendationImageUtils';
import { BACKLOG_SUBMISSION_CARD_WIDTH } from './BacklogSubmissionCard';

interface Props {
  items: BacklogRecommendationViewDto[];
  onSelect: (uid: string, voteRank: number) => void;
  emptyMessage?: string;
}

export default function BacklogSubmissionList({
  items,
  onSelect,
  emptyMessage = 'No backlog submissions yet.',
}: Props) {
  if (items.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: `repeat(auto-fill, minmax(${BACKLOG_SUBMISSION_CARD_WIDTH}px, ${BACKLOG_SUBMISSION_CARD_WIDTH}px))`,
        },
        gap: 1,
        justifyContent: 'start',
      }}
    >
      {items.map((item) => (
        <BacklogSubmissionCard
          key={item.uid}
          name={item.name}
          imageUid={recommendationCoverUid(item)}
          voteCount={item.voteCount}
          voteRank={item.voteRank}
          state={item.state}
          onClick={() => onSelect(item.uid, item.voteRank)}
        />
      ))}
    </Box>
  );
}
