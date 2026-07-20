import type { SchemaOutput } from '@/packages/schema';

import type {
  developmentGoalListResponseSchema,
  developmentGoalResponseSchema,
  sharedFeedbackListResponseSchema,
  sharedFeedbackResponseSchema,
} from '../schemas/development.schema';
import type { DevelopmentGoal, SharedFeedback } from '../types/assessments.types';

type FeedbackDto = SchemaOutput<typeof sharedFeedbackResponseSchema>;
type FeedbackListDto = SchemaOutput<typeof sharedFeedbackListResponseSchema>;
type GoalDto = SchemaOutput<typeof developmentGoalResponseSchema>;
type GoalListDto = SchemaOutput<typeof developmentGoalListResponseSchema>;

/** Player-facing feedback; the server already stripped private coach notes. */
function mapSharedFeedback(dto: FeedbackDto): SharedFeedback {
  return {
    id: dto.id,
    teamId: dto.teamId,
    membershipId: dto.membershipId,
    status: dto.status,
    revision: dto.revision,
    positiveFrisbee: dto.positiveFrisbee,
    frisbeeImprovement: dto.frisbeeImprovement,
    positiveMental: dto.positiveMental,
    mentalImprovement: dto.mentalImprovement,
    teamRole: dto.teamRole,
    recommendedPosition: dto.recommendedPosition,
    summary: dto.summary,
    publishedAtIso: dto.publishedAt,
    acknowledgedAtIso: dto.acknowledgedAt,
    clarificationRequested: dto.clarificationRequested,
  };
}

export function mapSharedFeedbackList(dto: FeedbackListDto): readonly SharedFeedback[] {
  return dto.items.map((item) => mapSharedFeedback(item));
}

export function mapDevelopmentGoal(dto: GoalDto): DevelopmentGoal {
  return {
    goal: {
      id: dto.goal.id,
      teamId: dto.goal.teamId,
      membershipId: dto.goal.membershipId,
      title: dto.goal.title,
      description: dto.goal.description,
      measurableTarget: dto.goal.measurableTarget,
      targetValue: dto.goal.targetValue,
      baselineValue: dto.goal.baselineValue,
      progressValue: dto.goal.progressValue,
      progressNote: dto.goal.progressNote,
      evidence: dto.goal.evidence,
      status: dto.goal.status,
      dueDate: dto.goal.dueDate,
      completedAtIso: dto.goal.completedAt,
      recordVersion: dto.goal.recordVersion,
    },
    actions: [...dto.actions]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((action) => ({
        description: action.description,
        sortOrder: action.sortOrder,
        done: action.done,
        dueDate: action.dueDate,
      })),
  };
}

export function mapDevelopmentGoals(dto: GoalListDto): readonly DevelopmentGoal[] {
  return dto.items.map((item) => mapDevelopmentGoal(item));
}
