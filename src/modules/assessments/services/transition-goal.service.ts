import { requestTransitionGoal } from '../gateways/development.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapDevelopmentGoal } from '../mappers/development.mapper';
import type { DevelopmentGoal, GoalTransitionInput } from '../types/assessments.types';

/** Use case: move one development goal along its lifecycle. */
export function transitionGoal(
  teamId: string,
  input: GoalTransitionInput,
): Promise<DevelopmentGoal> {
  return runAssessmentsRequest(async () =>
    mapDevelopmentGoal(
      await requestTransitionGoal(
        teamId,
        input.goalId,
        input.transition,
        input.expectedRecordVersion,
      ),
    ),
  );
}
