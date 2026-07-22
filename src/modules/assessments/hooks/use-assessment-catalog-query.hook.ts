import { useAppQuery } from '@/packages/query';
import { toAppError } from '@/shared/errors/app-error.helper';
import { type AppError } from '@/shared/errors/app.errors';

import { buildAssessmentCatalogQueryOptions } from '../queries/assessments.query';
import type { AssessmentCatalog } from '../types/assessments.types';

export interface AssessmentCatalogQueryView {
  readonly catalog: AssessmentCatalog | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/**
 * Loads the template/metric/scale/category/period catalog for a team. The
 * catalog endpoints are staff-scoped (`assessment.read.team`), so the caller
 * passes the resolved grant and the query stays idle without it.
 */
export function useAssessmentCatalogQuery(
  teamId: string,
  canReadCatalog: boolean,
): AssessmentCatalogQueryView {
  const query = useAppQuery(buildAssessmentCatalogQueryOptions(teamId, canReadCatalog));
  return {
    catalog: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
  };
}
