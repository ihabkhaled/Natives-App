import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildUpcomingPracticesQueryOptions } from '../queries/upcoming-practices.query';
import type { PracticeSessionSummary } from '../types/practice.types';

export interface UpcomingPracticesQueryView {
  readonly sessions: readonly PracticeSessionSummary[] | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

export function useUpcomingPracticesQuery(): UpcomingPracticesQueryView {
  const query = useAppQuery<readonly PracticeSessionSummary[]>(
    buildUpcomingPracticesQueryOptions(),
  );
  return {
    sessions: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
