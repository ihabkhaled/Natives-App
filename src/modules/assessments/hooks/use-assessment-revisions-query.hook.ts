import { useAppQuery } from '@/packages/query';

import { buildAssessmentRevisionsQueryOptions } from '../queries/assessments.query';
import type { AssessmentSummary } from '../types/assessments.types';

export interface AssessmentRevisionsQueryView {
  readonly revisions: readonly AssessmentSummary[];
  readonly isLoading: boolean;
}

/** Loads the revision family of one assessment; failures degrade to empty. */
export function useAssessmentRevisionsQuery(
  teamId: string,
  assessmentId: string,
): AssessmentRevisionsQueryView {
  const query = useAppQuery(buildAssessmentRevisionsQueryOptions(teamId, assessmentId));
  return { revisions: query.data ?? [], isLoading: query.isPending };
}
