import type { GoalCardView } from '../../types/assessments-view.types';

export interface DevelopmentGoalsPanelProps {
  readonly title: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly goals: readonly GoalCardView[];
  readonly isTransitioning: boolean;
  readonly onTransition: (goalId: string) => void;
}
