import { useAppQuery } from '@/packages/query';
import { toAppError } from '@/shared/errors/app-error.helper';
import { type AppError } from '@/shared/errors/app.errors';

import { buildAssessmentQueryOptions } from '../queries/assessments.query';
import type { AssessmentDetail } from '../types/assessments.types';

export interface AssessmentQueryView {
  readonly detail: AssessmentDetail | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

/** Loads one assessment with its values and a normalized AppError. */
export function useAssessmentQuery(teamId: string, assessmentId: string): AssessmentQueryView {
  const query = useAppQuery(buildAssessmentQueryOptions(teamId, assessmentId));
  return {
    detail: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
