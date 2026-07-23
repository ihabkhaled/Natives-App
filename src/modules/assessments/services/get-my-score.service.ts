import { requestMyPerformanceScore } from '../gateways/scoring.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapMyPerformanceScore } from '../mappers/scoring.mapper';
import type { MyPerformanceScore } from '../types/assessments.types';

/** Use case: load the signed-in player's own computed score (or null). */
export function getMyScore(teamId: string): Promise<MyPerformanceScore | null> {
  return runAssessmentsRequest(async () =>
    mapMyPerformanceScore(await requestMyPerformanceScore(teamId)),
  );
}
