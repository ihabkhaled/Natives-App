import type { MetricGroupView } from '../../types/assessments-view.types';

export interface AssessmentMetricGridProps {
  readonly groups: readonly MetricGroupView[];
  readonly gridLabel: string;
  readonly isDisabled: boolean;
  readonly noteLabel: string;
  readonly notePlaceholder: string;
  readonly notEvaluatedLabel: string;
  readonly notEvaluatedHint: string;
  readonly clearLabel: string;
  readonly onScoreChange: (metricDefinitionId: string, score: number) => void;
  readonly onNumericChange: (metricDefinitionId: string, raw: string) => void;
  readonly onTextChange: (metricDefinitionId: string, raw: string) => void;
  readonly onNoteChange: (metricDefinitionId: string, raw: string) => void;
  readonly onClearValue: (metricDefinitionId: string) => void;
}
