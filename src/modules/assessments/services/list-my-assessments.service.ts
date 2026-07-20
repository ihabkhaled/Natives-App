import { ASSESSMENTS_PAGE_SIZE } from '../constants/assessments.constants';
import { requestMyAssessments } from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapPublishedAssessments } from '../mappers/assessment.mapper';
import type { PublishedAssessment } from '../types/assessments.types';

/** Use case: load the signed-in player own published assessments. */
export function listMyAssessments(teamId: string): Promise<readonly PublishedAssessment[]> {
  return runAssessmentsRequest(async () =>
    mapPublishedAssessments(await requestMyAssessments(teamId, ASSESSMENTS_PAGE_SIZE, 0)),
  );
}
