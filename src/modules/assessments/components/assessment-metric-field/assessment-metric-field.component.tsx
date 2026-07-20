import { IonNote, IonText } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import { AssessmentMetricInput } from '../assessment-metric-input';
import type { AssessmentMetricFieldProps } from './assessment-metric-field.types';

/**
 * One metric. "Not evaluated" is a first-class state with its own readout and
 * an explicit clear action — a blank field is never shown or stored as 0.
 */
export function AssessmentMetricField(props: AssessmentMetricFieldProps): React.JSX.Element {
  const { field } = props;
  return (
    <div
      className="app-surface-card app-metric-field"
      data-testid={TEST_IDS.assessmentMetricField}
      data-evaluated={field.isEvaluated ? 'true' : 'false'}
    >
      <div className="app-metric-field__head">
        <IonText>
          <h4 className="app-metric-field__name m-0">{field.name}</h4>
        </IonText>
        <div className="app-metric-field__tags">
          <span className="app-metric-tag app-metric-tag--source">{field.sourceLabel}</span>
          <span className="app-metric-tag">{field.directionLabel}</span>
          {field.unitLabel === null ? null : (
            <span className="app-metric-tag">{field.unitLabel}</span>
          )}
          <span
            className={cx(
              'app-metric-tag',
              field.isRequired ? 'app-metric-tag--required' : undefined,
            )}
          >
            {field.requiredLabel}
          </span>
        </div>
      </div>
      <IonNote className="app-metric-field__definition">{field.definition}</IonNote>
      <AssessmentMetricInput
        field={field}
        isDisabled={props.isDisabled}
        onScoreChange={props.onScoreChange}
        onNumericChange={props.onNumericChange}
        onTextChange={props.onTextChange}
      />
      <AppInput
        testId={TEST_IDS.assessmentMetricNote}
        label={props.noteLabel}
        name={`metric-note-${field.metricDefinitionId}`}
        value={field.note ?? ''}
        placeholder={props.notePlaceholder}
        disabled={props.isDisabled}
        onValueChange={(raw) => {
          props.onNoteChange(field.metricDefinitionId, raw);
        }}
      />
      <div className="app-metric-field__foot">
        <span
          className={cx(
            'app-metric-readout',
            field.isEvaluated ? undefined : 'app-metric-readout--unknown',
          )}
          data-testid={TEST_IDS.assessmentMetricValueReadout}
        >
          {field.isEvaluated ? field.valueReadout : props.notEvaluatedLabel}
        </span>
        {props.isDisabled ? null : (
          <AppButton
            label={props.clearLabel}
            tone="ghost"
            testId={TEST_IDS.assessmentMetricNotEvaluated}
            onClick={() => {
              props.onClearValue(field.metricDefinitionId);
            }}
          />
        )}
      </div>
    </div>
  );
}
