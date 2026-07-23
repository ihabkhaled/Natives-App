import { useAppQuery } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildMyScoreQueryOptions } from '../queries/development.query';
import type { MyPerformanceScore } from '../types/assessments.types';

export interface MyScoreQueryView {
  readonly score: MyPerformanceScore | null | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/** Own computed score; never fires without `analytics.read.self`. */
export function useMyScoreQuery(teamId: string, canReadOwnAnalytics: boolean): MyScoreQueryView {
  const query = useAppQuery<MyPerformanceScore | null>(
    buildMyScoreQueryOptions(teamId, canReadOwnAnalytics),
  );
  return {
    score: query.data,
    isLoading: canReadOwnAnalytics && query.isPending,
    error: query.error === null ? null : toAppError(query.error),
  };
}
