import type { PracticeSessionQueryParams } from '../types/practice.types';

/** Stable query-key builders for the practice cache (list, upcoming, detail). */
export const practiceQueryKeys = {
  all: ['practice'] as const,
  sessions: (params: PracticeSessionQueryParams) =>
    [...practiceQueryKeys.all, 'sessions', params] as const,
  upcoming: () => [...practiceQueryKeys.all, 'upcoming'] as const,
  detail: (sessionId: string) => [...practiceQueryKeys.all, 'detail', sessionId] as const,
};
