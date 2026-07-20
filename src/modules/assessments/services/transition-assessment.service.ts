import { ASSESSMENT_WORKFLOW_STEP } from '../constants/assessments.constants';
import {
  requestPublishAssessment,
  requestReviewAssessment,
  requestSubmitAssessment,
} from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapAssessmentDetail } from '../mappers/assessment.mapper';
import type { AssessmentDetail, AssessmentTransitionInput } from '../types/assessments.types';

/**
 * Use case: advance one assessment through draft → submitted → in review →
 * approved → published. Submit and publish own endpoints; the three review
 * decisions share the review endpoint.
 */
export function transitionAssessment(
  teamId: string,
  input: AssessmentTransitionInput,
): Promise<AssessmentDetail> {
  return runAssessmentsRequest(async () => {
    if (input.step === ASSESSMENT_WORKFLOW_STEP.Submit) {
      return mapAssessmentDetail(
        await requestSubmitAssessment(teamId, input.assessmentId, input.expectedRecordVersion),
      );
    }
    if (input.step === ASSESSMENT_WORKFLOW_STEP.Publish) {
      return mapAssessmentDetail(
        await requestPublishAssessment(teamId, input.assessmentId, input.expectedRecordVersion),
      );
    }
    return mapAssessmentDetail(
      await requestReviewAssessment(
        teamId,
        input.assessmentId,
        input.expectedRecordVersion,
        input.step,
      ),
    );
  });
}
