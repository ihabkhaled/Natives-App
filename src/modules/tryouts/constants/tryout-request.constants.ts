import { TRYOUT_LIMITS } from './tryouts.constants';

/** Bounded query windows every tryout read sends. */
export const EVENT_PAGE_PARAMS = { limit: TRYOUT_LIMITS.pageSize, offset: 0 } as const;

export const CANDIDATE_PAGE_PARAMS = {
  limit: TRYOUT_LIMITS.candidatePageSize,
  offset: 0,
} as const;
