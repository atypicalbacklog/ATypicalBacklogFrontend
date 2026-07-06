import { Box, Stack, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SmartImage from '../shared/SmartImage';
import SubmissionStateBorderFrame from './backlogSubmissionBorderFrame';
import { getSubmissionImageBorder } from './backlogSubmissionStateLabels';

export const BACKLOG_SUBMISSION_CARD_WIDTH = 200;
const CARD_HEIGHT = 280;
const MOBILE_CARD_HEIGHT = 280;
const COVER_HEIGHT = 240;
const MOBILE_COVER_HEIGHT = 240;

const BADGE_SX = {
  borderRadius: 1,
  px: 0.875,
  py: 0.3,
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

interface Props {
  name: string;
  imageUid: string | null;
  voteCount: number;
  voteRank?: number;
  state?: string | null;
  onClick?: () => void;
}

export default function BacklogSubmissionCard({
  name,
  imageUid,
  voteCount,
  voteRank,
  state,
  onClick,
}: Props) {
  const imageBorder = getSubmissionImageBorder(state);

  return (
    <Box
      onClick={onClick}
      sx={{
        width: { xs: '100%', sm: BACKLOG_SUBMISSION_CARD_WIDTH },
        maxWidth: BACKLOG_SUBMISSION_CARD_WIDTH,
        height: { xs: MOBILE_CARD_HEIGHT, sm: CARD_HEIGHT },
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        boxShadow: 1,
        border: 1,
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        transition: (theme) =>
          theme.transitions.create('border-color', {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': onClick
          ? {
              borderColor: 'primary.main',
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: '100%',
          height: { xs: MOBILE_COVER_HEIGHT, sm: COVER_HEIGHT },
        }}
      >
        <SubmissionStateBorderFrame
          border={imageBorder}
          borderRadius={0}
          innerBg="transparent"
          sx={{ height: '100%' }}
        >
          <SmartImage
            imageUid={imageUid}
            thumbnail
            alt=""
            placeholderLabel={name}
            sx={{
              width: '100%',
              height: '100%',
            }}
            imgSx={{ objectFit: 'contain' }}
          />
        </SubmissionStateBorderFrame>
        {/* Rank and vote count always visible, including when upvotes are disabled by state. */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            right: 6,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pointerEvents: 'none',
          }}
        >
          {voteRank != null ? (
            <Box
              sx={{
                ...BADGE_SX,
                bgcolor: 'rgba(0,0,0,0.65)',
                color: 'grey.400',
              }}
            >
              #{voteRank}
            </Box>
          ) : (
            <span />
          )}
          <Box
            sx={{
              ...BADGE_SX,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.35,
              bgcolor: 'rgba(0,0,0,0.65)',
              color: '#fff',
            }}
          >
            <ArrowUpwardIcon sx={{ fontSize: 18 }} />
            {voteCount}
          </Box>
        </Box>
      </Box>
      <Stack
        sx={{
          px: 1,
          py: 0.75,
          flex: 1,
          minHeight: 0,
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          title={name}
          sx={{
            lineHeight: 1.25,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name}
        </Typography>
      </Stack>
    </Box>
  );
}
