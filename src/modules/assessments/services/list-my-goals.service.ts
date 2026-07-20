import { ASSESSMENTS_PAGE_SIZE } from '../constants/assessments.constants';
import { requestMyDevelopmentGoals } from '../gateways/development.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapDevelopmentGoals } from '../mappers/development.mapper';
import type { DevelopmentGoal } from '../types/assessments.types';

/** Use case: load the signed-in player own development goals. */
export function listMyGoals(teamId: string): Promise<readonly DevelopmentGoal[]> {
  return runAssessmentsRequest(async () =>
    mapDevelopmentGoals(await requestMyDevelopmentGoals(teamId, ASSESSMENTS_PAGE_SIZE, 0)),
  );
}
