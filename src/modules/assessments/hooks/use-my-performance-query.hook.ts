import { useAppQuery } from '@/packages/query';
import { toAppError } from '@/shared/errors/app-error.helper';
import { type AppError } from '@/shared/errors/app.errors';

import {
  buildMyAssessmentsQueryOptions,
  buildMyFeedbackQueryOptions,
  buildMyGoalsQueryOptions,
} from '../queries/development.query';
import type {
  DevelopmentGoal,
  PublishedAssessment,
  SharedFeedback,
} from '../types/assessments.types';

export interface MyPerformanceQueryView {
  readonly assessments: readonly PublishedAssessment[] | undefined;
  readonly feedback: readonly SharedFeedback[];
  readonly goals: readonly DevelopmentGoal[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

/**
 * The player performance screen reads three own-scope collections. Only the
 * published assessments gate the screen state; feedback and goals degrade to
 * their own empty states so one slow section never blanks the page.
 */
export function useMyPerformanceQuery(teamId: string): MyPerformanceQueryView {
  const assessments = useAppQuery(buildMyAssessmentsQueryOptions(teamId));
  const feedback = useAppQuery(buildMyFeedbackQueryOptions(teamId));
  const goals = useAppQuery(buildMyGoalsQueryOptions(teamId));
  return {
    assessments: assessments.data,
    feedback: feedback.data ?? [],
    goals: goals.data ?? [],
    isLoading: assessments.isPending || feedback.isPending || goals.isPending,
    error: assessments.error === null ? null : toAppError(assessments.error),
    refetch: () => {
      void assessments.refetch();
      void feedback.refetch();
      void goals.refetch();
    },
  };
}
