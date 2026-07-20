import { requestAssessmentRevisions } from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapAssessmentSummary } from '../mappers/assessment.mapper';
import type { AssessmentSummary } from '../types/assessments.types';

/** Use case: load the revision family of one assessment. */
export function getAssessmentRevisions(
  teamId: string,
  assessmentId: string,
): Promise<readonly AssessmentSummary[]> {
  return runAssessmentsRequest(async () => {
    const dto = await requestAssessmentRevisions(teamId, assessmentId);
    return dto.items.map((item) => mapAssessmentSummary(item));
  });
}
