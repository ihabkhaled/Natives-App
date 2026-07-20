import { requestSaveAssessmentValues } from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapAssessmentDetail } from '../mappers/assessment.mapper';
import type { AssessmentDetail, SaveAssessmentValuesInput } from '../types/assessments.types';

/** Use case: persist the evaluator draft values under optimistic concurrency. */
export function saveAssessmentValues(
  teamId: string,
  assessmentId: string,
  input: SaveAssessmentValuesInput,
): Promise<AssessmentDetail> {
  return runAssessmentsRequest(async () =>
    mapAssessmentDetail(await requestSaveAssessmentValues(teamId, assessmentId, input)),
  );
}
