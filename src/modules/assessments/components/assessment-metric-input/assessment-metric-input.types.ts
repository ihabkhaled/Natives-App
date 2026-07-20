import type { MetricFieldView } from '../../types/assessments-view.types';

export interface AssessmentMetricInputProps {
  readonly field: MetricFieldView;
  readonly isDisabled: boolean;
  readonly onScoreChange: (metricDefinitionId: string, score: number) => void;
  readonly onNumericChange: (metricDefinitionId: string, raw: string) => void;
  readonly onTextChange: (metricDefinitionId: string, raw: string) => void;
}
