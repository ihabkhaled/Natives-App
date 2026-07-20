import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  feedbackAcknowledgePath,
  goalTransitionPath,
  myDevelopmentGoalsPath,
  myFeedbackPath,
} from '../constants/assessments-api.constants';
import {
  developmentGoalListResponseSchema,
  developmentGoalResponseSchema,
  feedbackAcknowledgementResponseSchema,
  sharedFeedbackListResponseSchema,
} from '../schemas/development.schema';
import type { GoalTransition } from '../constants/assessments.constants';

type FeedbackListDto = SchemaOutput<typeof sharedFeedbackListResponseSchema>;
type AcknowledgementDto = SchemaOutput<typeof feedbackAcknowledgementResponseSchema>;
type GoalListDto = SchemaOutput<typeof developmentGoalListResponseSchema>;
type GoalDto = SchemaOutput<typeof developmentGoalResponseSchema>;

/** The signed-in player's own published feedback. */
export function requestMyFeedback(
  teamId: string,
  limit: number,
  offset: number,
): Promise<FeedbackListDto> {
  return getAppHttpClient().get(myFeedbackPath(teamId), sharedFeedbackListResponseSchema, {
    params: { limit, offset },
  });
}

/** Record that the player read the feedback, optionally asking for more. */
export function requestAcknowledgeFeedback(
  teamId: string,
  feedbackId: string,
  clarificationRequested: boolean,
): Promise<AcknowledgementDto> {
  return getAppHttpClient().post(
    feedbackAcknowledgePath(teamId, feedbackId),
    { clarificationRequested },
    feedbackAcknowledgementResponseSchema,
  );
}

/** The signed-in player's own development goals with their action plans. */
export function requestMyDevelopmentGoals(
  teamId: string,
  limit: number,
  offset: number,
): Promise<GoalListDto> {
  return getAppHttpClient().get(myDevelopmentGoalsPath(teamId), developmentGoalListResponseSchema, {
    params: { limit, offset },
  });
}

/** Move one goal along its lifecycle under optimistic concurrency. */
export function requestTransitionGoal(
  teamId: string,
  goalId: string,
  transition: GoalTransition,
  expectedRecordVersion: number,
): Promise<GoalDto> {
  return getAppHttpClient().post(
    goalTransitionPath(teamId, goalId),
    { transition, expectedRecordVersion },
    developmentGoalResponseSchema,
  );
}
