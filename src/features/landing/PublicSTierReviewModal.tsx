import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import DateWithIcon from '../shared/DateWithIcon';
import ReviewModalHeader from '../reviews/ReviewModalHeader';
import { getAppConfig } from '../../app/AppConfig';
import { yearFromReviewDate } from '../reviews/reviewPresentationUtils';
import { LANDING_REVIEW_MODAL_MAX_WIDTH } from './landingLayout';
import type { PublicSTierReviewFeedItemDto } from '../../types/feedDto';

interface Props {
  item: PublicSTierReviewFeedItemDto | null;
  open: boolean;
  onClose: () => void;
}

export default function PublicSTierReviewModal({ item, open, onClose }: Props) {
  const navigate = useNavigate();
  const isManagement = getAppConfig().mode === 'MANAGEMENT';

  const imageUid = item?.preferredImageUid ?? item?.imageUid ?? null;
  const reviewYear = yearFromReviewDate(item?.reviewDate);
  const gameInstanceUid = item?.gameInstanceUid ?? null;

  const goToYearlyReview = () => {
    if (reviewYear == null) return;
    onClose();
    navigate(`/reviews/yearly?year=${reviewYear}`);
  };

  const goToGameDetail = () => {
    if (!gameInstanceUid) return;
    onClose();
    navigate(`/game-instances/${gameInstanceUid}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      scroll="paper"
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: LANDING_REVIEW_MODAL_MAX_WIDTH,
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        {item ? (
          <ReviewModalHeader
            tierUid={item.tierUid}
            displayName={item.name}
            imageUid={imageUid}
            presentationType={item.presentationType}
            belowTitle={
              item.reviewDate ? (
                <DateWithIcon date={item.reviewDate} tooltip="Review Date" variant="caption" />
              ) : undefined
            }
            showYearlyReviewButton
            reviewYear={reviewYear}
            onYearlyReview={goToYearlyReview}
            showGameDetailButton={isManagement}
            gameInstanceUid={gameInstanceUid}
            onGameDetail={goToGameDetail}
            navLayout="landing"
          />
        ) : (
          'Review'
        )}
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {item?.reviewText?.trim() ? (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {item.reviewText}
          </Typography>
        ) : item ? (
          <Typography variant="body2" color="text.secondary">
            No written review text.
          </Typography>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
