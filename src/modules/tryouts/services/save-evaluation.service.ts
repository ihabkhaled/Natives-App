import { requestSaveEvaluation } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapCandidateDetail } from '../mappers/tryout.mapper';
import type { CandidateDetail, SaveEvaluationCommand } from '../types/tryouts.types';

/** Use case: record evaluator scores. An unscored criterion stays null. */
export function saveEvaluation(
  teamId: string,
  tryoutId: string,
  command: SaveEvaluationCommand,
): Promise<CandidateDetail> {
  return runRequest(async () =>
    mapCandidateDetail(await requestSaveEvaluation(teamId, tryoutId, command)),
  );
}
