import type { RsvpDetailScreenView } from '../../types/practice-rsvp-detail-view.types';

export type RsvpRosterProps = Pick<
  RsvpDetailScreenView,
  | 'statusFilterLabel'
  | 'statusFilterOptions'
  | 'statusFilter'
  | 'onStatusFilterChange'
  | 'countLabel'
  | 'rows'
  | 'emptyLabel'
  | 'hasMore'
  | 'isLoadingMore'
  | 'loadMoreLabel'
  | 'onLoadMore'
>;
