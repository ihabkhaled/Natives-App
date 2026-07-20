import { requestAssessment } from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapAssessmentDetail } from '../mappers/assessment.mapper';
import type { AssessmentDetail } from '../types/assessments.types';

/** Use case: load one assessment with its values. */
export function getAssessment(teamId: string, assessmentId: string): Promise<AssessmentDetail> {
  return runAssessmentsRequest(async () =>
    mapAssessmentDetail(await requestAssessment(teamId, assessmentId)),
  );
}
