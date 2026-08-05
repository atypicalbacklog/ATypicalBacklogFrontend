import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Stack } from '@mui/material';
import {
  fetchRandomBacklogFeed,
  fetchRandomBacklogRecommendationFeed,
  fetchRandomSTierReviewFeed,
  fetchRecentActivityFeed,
} from '../../services/publicFeedApi';
import type {
  BacklogOverviewGameDto,
  PublicRandomBacklogRecommendationFeedItemDto,
  PublicSTierReviewFeedItemDto,
  RecentActivityFeedItemDto,
} from '../../types/feedDto';
import FeedGallery from './FeedGallery';
import { FeedTooltipProvider } from './FeedTooltipContext';
import BacklogFeedCard from './BacklogFeedCard';
import BacklogSubmissionFeedCard from './BacklogSubmissionFeedCard';
import FeedGameCard from './FeedGameCard';
import LandingPageFooter from './LandingPageFooter';
import LandingPageHero from './LandingPageHero';
import PublicSTierReviewModal from './PublicSTierReviewModal';
import {
  LANDING_CAPTION_CARD_IMAGE_HEIGHT,
  LANDING_CAPTION_CARD_MIN_HEIGHT,
  LANDING_CAPTION_CARD_WIDTH,
  LANDING_FEED_COUNT,
  LANDING_RECENT_ACTIVITY_MAX_PER_CATEGORY,
  LANDING_RECENT_ACTIVITY_TOTAL,
} from './landingFeedConstants';
import { recentActivityLabel } from './recentActivityLabels';

export default function LandingPage() {
  const [recentActivity, setRecentActivity] = useState<RecentActivityFeedItemDto[]>([]);
  const [randomBacklog, setRandomBacklog] = useState<BacklogOverviewGameDto[]>([]);
  const [sTierReviews, setSTierReviews] = useState<PublicSTierReviewFeedItemDto[]>([]);
  const [recommendations, setRecommendations] = useState<
    PublicRandomBacklogRecommendationFeedItemDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<PublicSTierReviewFeedItemDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchRecentActivityFeed({
        totalCount: LANDING_RECENT_ACTIVITY_TOTAL,
        maxPerCategory: LANDING_RECENT_ACTIVITY_MAX_PER_CATEGORY,
      }),
      fetchRandomBacklogFeed({ count: LANDING_FEED_COUNT }),
      fetchRandomSTierReviewFeed({ count: LANDING_FEED_COUNT }),
      fetchRandomBacklogRecommendationFeed({ count: LANDING_FEED_COUNT }),
    ])
      .then(([recent, backlog, reviews, recs]) => {
        if (cancelled) return;
        setRecentActivity(recent);
        setRandomBacklog(backlog);
        setSTierReviews(reviews);
        setRecommendations(
          [...recs].sort((a, b) => a.voteRank - b.voteRank || b.voteCount - a.voteCount)
        );
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load landing page content.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <>
        <LandingPageHero />
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      </>
    );
  }

  return (
    <FeedTooltipProvider>
      <LandingPageHero />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FeedGallery
        title="Recent activity"
        items={recentActivity}
        mode="scroll"
        hideWhenEmpty
        getItemKey={(item) => `${item.category}-${item.row.gameUid}`}
        renderItem={(item) => (
          <FeedGameCard
            imageUid={item.row.imageUid}
            title={item.row.name}
            caption={recentActivityLabel(item.category)}
          />
        )}
      />

      <FeedGallery
        title="Example games currently in backlog"
        items={randomBacklog}
        mode="page"
        cardWidth={LANDING_CAPTION_CARD_WIDTH}
        minCardHeight={LANDING_CAPTION_CARD_MIN_HEIGHT}
        getItemKey={(item) => item.backlogUid}
        renderItem={(item) => <BacklogFeedCard item={item} />}
      />

      <FeedGallery
        title="S-Tier reviewed Game Highlights"
        items={sTierReviews}
        mode="scroll"
        scrollDirection="right"
        hideWhenEmpty
        getItemKey={(item) => item.reviewUid}
        renderItem={(item) => (
          <FeedGameCard
            imageUid={item.preferredImageUid ?? item.imageUid}
            title={item.name}
            onClick={() => setSelectedReview(item)}
          />
        )}
      />

      <FeedGallery
        title="Backlog submissions"
        items={recommendations}
        mode="page"
        cardWidth={LANDING_CAPTION_CARD_WIDTH}
        minCardHeight={LANDING_CAPTION_CARD_IMAGE_HEIGHT}
        hideWhenEmpty
        getItemKey={(item) => item.backlogRecommendationUid}
        renderItem={(item) => <BacklogSubmissionFeedCard item={item} />}
      />

      <LandingPageFooter />

      <PublicSTierReviewModal
        item={selectedReview}
        open={selectedReview != null}
        onClose={() => setSelectedReview(null)}
      />
    </FeedTooltipProvider>
  );
}
