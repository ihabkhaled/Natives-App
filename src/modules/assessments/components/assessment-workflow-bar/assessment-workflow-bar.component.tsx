import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { AssessmentWorkflowBarProps } from './assessment-workflow-bar.types';

/**
 * Draft → submit → review → publish. Only the steps the lifecycle allows and
 * the principal holds a grant for are rendered; the backend re-authorizes.
 */
export function AssessmentWorkflowBar(props: AssessmentWorkflowBarProps): React.JSX.Element {
  return (
    <div
      className="app-workflow-bar"
      data-testid={TEST_IDS.assessmentWorkflowBar}
      role="group"
      aria-label={props.workflowLabel}
    >
      <div className="app-workflow-bar__meter">
        <span className="app-eyebrow app-workflow-bar__label">{props.completenessLabel}</span>
        <span className="app-workflow-bar__value" data-testid={TEST_IDS.assessmentCompleteness}>
          {props.completenessValue}
        </span>
        <span
          className="app-workflow-bar__track"
          role="progressbar"
          aria-label={props.completenessLabel}
          aria-valuenow={props.completenessPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="app-workflow-bar__fill"
            style={{ inlineSize: `${String(props.completenessPercent)}%` }}
          />
        </span>
      </div>
      <div className="app-workflow-bar__actions">
        {props.readOnlyLabel === '' ? null : <IonNote>{props.readOnlyLabel}</IonNote>}
        {props.isEditable ? (
          <AppButton
            label={props.saveLabel}
            tone="secondary"
            loading={props.isSaving}
            testId={TEST_IDS.assessmentSaveDraft}
            onClick={props.onSave}
          />
        ) : null}
        {props.actions.map((action) => (
          <AppButton
            key={action.step}
            label={action.label}
            tone={action.tone}
            loading={props.isTransitioning}
            testId={action.testId}
            onClick={() => {
              props.onWorkflowStep(action.step);
            }}
          />
        ))}
      </div>
    </div>
  );
}
