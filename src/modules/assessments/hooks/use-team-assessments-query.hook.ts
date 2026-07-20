import { useAppQuery } from '@/packages/query';
import { toAppError } from '@/shared/errors/app-error.helper';
import { type AppError } from '@/shared/errors/app.errors';

import { buildTeamAssessmentsQueryOptions } from '../queries/assessments.query';
import type { AssessmentPage } from '../types/assessments.types';

export interface TeamAssessmentsQueryView {
  readonly page: AssessmentPage | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

/** Loads one bounded page of team assessments with a normalized AppError. */
export function useTeamAssessmentsQuery(teamId: string): TeamAssessmentsQueryView {
  const query = useAppQuery(buildTeamAssessmentsQueryOptions(teamId));
  return {
    page: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
