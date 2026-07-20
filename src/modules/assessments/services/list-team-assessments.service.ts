import { ASSESSMENTS_PAGE_SIZE } from '../constants/assessments.constants';
import { requestTeamAssessments } from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapAssessmentPage } from '../mappers/assessment.mapper';
import type { AssessmentPage } from '../types/assessments.types';

/** Use case: load one bounded page of the team assessments. */
export function listTeamAssessments(teamId: string): Promise<AssessmentPage> {
  return runAssessmentsRequest(async () =>
    mapAssessmentPage(await requestTeamAssessments(teamId, ASSESSMENTS_PAGE_SIZE, 0)),
  );
}
