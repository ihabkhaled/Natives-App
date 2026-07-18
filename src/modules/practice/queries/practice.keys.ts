import type { PracticeSessionQueryParams } from '../types/practice.types';

/** Stable query-key builders for the practice cache (list, upcoming, detail). */
export const practiceQueryKeys = {
  all: ['practice'] as const,
  team: (teamId: string) => [...practiceQueryKeys.all, 'team', teamId] as const,
  sessions: (teamId: string, params: PracticeSessionQueryParams) =>
    [...practiceQueryKeys.team(teamId), 'sessions', params] as const,
  upcoming: (teamId: string) => [...practiceQueryKeys.team(teamId), 'upcoming'] as const,
  detail: (teamId: string, sessionId: string) =>
    [...practiceQueryKeys.team(teamId), 'detail', sessionId] as const,
};
