import { TEST_IDS } from '@/shared/config';
import { AppInput } from '@/shared/ui';

import { LEGACY_SCORE_STEPS } from '../../constants/assessments.constants';
import type { AssessmentMetricInputProps } from './assessment-metric-input.types';

/**
 * The scale-aware control for one metric: discrete 0–5 chips, a measured
 * number, or free text. An empty field always means "not evaluated".
 */
export function AssessmentMetricInput(props: AssessmentMetricInputProps): React.JSX.Element {
  const { field } = props;
  return (
    <>
      {field.isScoreScale ? (
        <div
          className="app-metric-field__scores"
          role="group"
          aria-label={field.inputLabel}
          data-testid={TEST_IDS.assessmentMetricScore}
        >
          {LEGACY_SCORE_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              className="app-score-chip"
              aria-pressed={field.numericValue === step}
              disabled={props.isDisabled}
              onClick={() => {
                props.onScoreChange(field.metricDefinitionId, step);
              }}
            >
              {step}
            </button>
          ))}
        </div>
      ) : null}
      {field.isTextScale ? (
        <AppInput
          testId={TEST_IDS.assessmentMetricText}
          label={field.inputLabel}
          name={`metric-text-${field.metricDefinitionId}`}
          value={field.textValue ?? ''}
          disabled={props.isDisabled}
          onValueChange={(raw) => {
            props.onTextChange(field.metricDefinitionId, raw);
          }}
        />
      ) : null}
      {!field.isScoreScale && !field.isTextScale ? (
        <AppInput
          testId={TEST_IDS.assessmentMetricNumber}
          label={field.inputLabel}
          name={`metric-${field.metricDefinitionId}`}
          type="number"
          value={field.numericValue === null ? '' : String(field.numericValue)}
          disabled={props.isDisabled}
          onValueChange={(raw) => {
            props.onNumericChange(field.metricDefinitionId, raw);
          }}
        />
      ) : null}
    </>
  );
}
