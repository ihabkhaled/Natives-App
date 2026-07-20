import { ASSESSMENTS_PAGE_SIZE } from '../constants/assessments.constants';
import { requestMyFeedback } from '../gateways/development.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapSharedFeedbackList } from '../mappers/development.mapper';
import type { SharedFeedback } from '../types/assessments.types';

/** Use case: load the signed-in player own published coach feedback. */
export function listMyFeedback(teamId: string): Promise<readonly SharedFeedback[]> {
  return runAssessmentsRequest(async () =>
    mapSharedFeedbackList(await requestMyFeedback(teamId, ASSESSMENTS_PAGE_SIZE, 0)),
  );
}
