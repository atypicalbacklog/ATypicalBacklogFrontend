export type BacklogSubmissionStateBorder = 'none' | 'gold' | 'rainbow' | 'red' | 'blue';

export interface BacklogSubmissionStatePresentation {
  showBanner: boolean;
  message: string | null;
  border: BacklogSubmissionStateBorder;
  allowUpvote: boolean;
  allowComment: boolean;
  showStateDate: boolean;
}

export function getBacklogSubmissionStatePresentation(
  state: string,
  stateReason: string | null
): BacklogSubmissionStatePresentation {
  switch (state) {
    case 'NEW':
      return {
        showBanner: false,
        message: null,
        border: 'none',
        allowUpvote: true,
        allowComment: true,
        showStateDate: false,
      };
    case 'CONFIRMED_FOR_BACKLOG':
      return {
        showBanner: true,
        message: 'Has been added to backlog, thank you for your submission',
        border: 'gold',
        allowUpvote: true,
        allowComment: true,
        showStateDate: true,
      };
    case 'FINISHED':
      return {
        showBanner: true,
        message: 'Has been played already, thank you for your submission',
        border: 'rainbow',
        allowUpvote: false,
        allowComment: true,
        showStateDate: true,
      };
    case 'REJECTED':
      return {
        showBanner: true,
        message: `Has been rejected: ${stateReason ?? ''}`.trimEnd(),
        border: 'red',
        allowUpvote: true,
        allowComment: true,
        showStateDate: true,
      };
    case 'UP_FOR_REPLAY':
      return {
        showBanner: true,
        message: 'Has been played already, but community wants a replay',
        border: 'blue',
        allowUpvote: true,
        allowComment: true,
        showStateDate: true,
      };
    case 'RESUBMIT':
      return {
        showBanner: true,
        message: 'Has been rejected already, will be investigated',
        border: 'red',
        allowUpvote: true,
        allowComment: true,
        showStateDate: true,
      };
    case 'DUPLICATE':
      return {
        showBanner: true,
        message: 'Erroneous resubmission, will be merged',
        border: 'red',
        allowUpvote: false,
        allowComment: false,
        showStateDate: true,
      };
    default:
      return {
        showBanner: false,
        message: null,
        border: 'none',
        allowUpvote: true,
        allowComment: true,
        showStateDate: false,
      };
  }
}

/** Colored cover border in list/detail; independent of upvote/comment rules. */
export function getSubmissionImageBorder(state: string | null | undefined): BacklogSubmissionStateBorder {
  if (!state) return 'none';
  const presentation = getBacklogSubmissionStatePresentation(state, null);
  return presentation.showBanner && presentation.border !== 'none' ? presentation.border : 'none';
}
