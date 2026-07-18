import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildPracticeSessionQueryOptions } from '../queries/practice-session.query';
import type { PracticeSessionDetail } from '../types/practice.types';

export interface PracticeSessionQueryView {
  readonly session: PracticeSessionDetail | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

export function usePracticeSessionQuery(
  teamId: string,
  sessionId: string,
): PracticeSessionQueryView {
  const query = useAppQuery<PracticeSessionDetail>(
    buildPracticeSessionQueryOptions(teamId, sessionId),
  );
  return {
    session: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
