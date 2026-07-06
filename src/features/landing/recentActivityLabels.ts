import type { RecentActivityCategory } from '../../types/feedDto';

export function recentActivityLabel(category: RecentActivityCategory): string {
  switch (category) {
    case 'BACKLOG_RECENT':
      return 'Recently added to backlog';
    case 'ENDED_PLAYTHROUGH':
      return 'Recently ended playthrough';
    case 'RECENT_COMPLETION':
      return 'Recently completed';
    case 'RECENT_PLAY':
      return 'Recently played';
    default:
      return category;
  }
}
