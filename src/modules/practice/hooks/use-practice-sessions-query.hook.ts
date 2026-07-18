import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildPracticeSessionsQueryOptions } from '../queries/practice-sessions.query';
import type { PracticeSessionListPage, PracticeSessionQueryParams } from '../types/practice.types';

export interface PracticeSessionsQueryView {
  readonly page: PracticeSessionListPage | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

export function usePracticeSessionsQuery(
  params: PracticeSessionQueryParams,
): PracticeSessionsQueryView {
  const query = useAppQuery<PracticeSessionListPage>(buildPracticeSessionsQueryOptions(params));
  return {
    page: query.data,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
