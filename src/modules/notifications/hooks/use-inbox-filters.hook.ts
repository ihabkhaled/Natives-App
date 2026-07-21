import { useState } from 'react';

import {
  ALL_CATEGORIES_FILTER,
  NOTIFICATION_LIMITS,
  type InboxStatusFilter,
} from '../constants/notifications.constants';

export interface InboxFiltersView {
  readonly status: InboxStatusFilter;
  readonly category: string;
  readonly limit: number;
  readonly setStatus: (value: string) => void;
  readonly setCategory: (value: string) => void;
  readonly growWindow: () => void;
}

/**
 * The inbox's own client state: the two filters and how far the bounded
 * window has been grown. The window only ever grows by one page and stops at
 * the hard ceiling, so "load more" can never become an unbounded export.
 */
export function useInboxFilters(): InboxFiltersView {
  const [status, setStatusValue] = useState<InboxStatusFilter>('all');
  const [category, setCategoryValue] = useState<string>(ALL_CATEGORIES_FILTER);
  const [limit, setLimit] = useState<number>(NOTIFICATION_LIMITS.pageSize);
  return {
    status,
    category,
    limit,
    setStatus: (value: string) => {
      setStatusValue(value as InboxStatusFilter);
    },
    setCategory: setCategoryValue,
    growWindow: () => {
      setLimit((current) =>
        Math.min(current + NOTIFICATION_LIMITS.pageSize, NOTIFICATION_LIMITS.maxItems),
      );
    },
  };
}
