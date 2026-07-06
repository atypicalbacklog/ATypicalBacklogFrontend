import { Box, Button, Stack, Typography } from '@mui/material';
import type { UnifiedGameSearchResultDto } from '../../types/backlogRecommendationDto';
import { yearlyReviewSolidTextPanelSx } from '../yearlyReview/yearlyReviewPanelStyles';
import DateWithIcon from '../shared/DateWithIcon';
import SmartImage from '../shared/SmartImage';
import { unifiedSearchCoverUid } from './recommendationImageUtils';
import { unifiedSearchResultDate } from './unifiedSearchResultUtils';

export const UNIFIED_SEARCH_PANEL_MAX_WIDTH = 720;

interface Props {
  results: UnifiedGameSearchResultDto[];
  submissionGameUids: Set<string>;
  onAddSubmission: (result: UnifiedGameSearchResultDto) => void;
}

export default function UnifiedGameSearchPanel({
  results,
  submissionGameUids,
  onAddSubmission,
}: Props) {
  if (results.length === 0) return null;

  const canAddAny = results.some(
    (item) => !item.gameUid || !submissionGameUids.has(item.gameUid)
  );

  return (
    <Box
      sx={{
        ...yearlyReviewSolidTextPanelSx,
        mb: 2,
        width: '100%',
        maxWidth: UNIFIED_SEARCH_PANEL_MAX_WIDTH,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Existing games in library or backlog
      </Typography>
      {canAddAny ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          These games already exist. You can add a new backlog submission for one of them.
        </Typography>
      ) : null}
      <Stack spacing={1.5}>
        {results.map((item, index) => {
          const imageUid = unifiedSearchCoverUid(item);
          const dateInfo = unifiedSearchResultDate(item);
          const hasSubmission =
            item.gameUid != null && submissionGameUids.has(item.gameUid);
          return (
            <Stack
              key={`${item.resultType}-${item.gameUid ?? item.name}-${index}`}
              direction="row"
              alignItems="center"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              <SmartImage
                imageUid={imageUid}
                thumbnail
                alt=""
                placeholderLabel={item.name}
                sx={{ width: 48, flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0, flex: '1 1 160px' }}>
                <Typography variant="body2" fontWeight={600}>
                  {item.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary">
                    {item.resultType === 'BACKLOG' ? 'In backlog' : 'In library'}
                    {hasSubmission ? ' · Has backlog submission' : ''}
                  </Typography>
                  {dateInfo ? (
                    <DateWithIcon
                      date={dateInfo.date}
                      tooltip={dateInfo.tooltip}
                      variant="caption"
                    />
                  ) : null}
                </Stack>
              </Box>
              {!hasSubmission ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onAddSubmission(item)}
                  sx={{ flexShrink: 0 }}
                >
                  Add backlog submission
                </Button>
              ) : null}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
