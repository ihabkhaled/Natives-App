import { StandingsNumberFields } from '../standings-number-fields';
import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import { TieBreakOrderBuilder } from '../tie-break-order-builder';
import { StandingsDialogForm } from '../standings-dialog-form';
import type { RuleVersionFormProps } from './rule-version-form.types';

/**
 * Publish version N+1 of a rule family. Nothing here edits an existing
 * version — submitting always creates the next immutable version, which the
 * list then highlights.
 */
export function RuleVersionForm(props: RuleVersionFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <StandingsDialogForm testId={TEST_IDS.ruleForm} heading={view.heading} onSubmit={view.onSubmit}>
      <AppInput
        testId={TEST_IDS.ruleFormKey}
        label={view.keyLabel}
        name="rule-key"
        value={view.keyValue}
        onValueChange={view.onKeyChange}
      />
      <IonNote>{view.keyHint}</IonNote>
      <AppInput
        testId={TEST_IDS.ruleFormName}
        label={view.nameLabel}
        name="rule-name"
        value={view.nameValue}
        onValueChange={view.onNameChange}
      />
      <div className="app-standings-dialog__grid">
        <StandingsNumberFields fields={view.pointFields} />
      </div>
      <IonText>
        <h4 className="m-0 text-sm">{view.tieBreakHeading}</h4>
      </IonText>
      <TieBreakOrderBuilder view={view} />
      {view.validationMessage === null ? null : (
        <IonNote color="danger" role="alert" data-testid={TEST_IDS.ruleFormError}>
          {view.validationMessage}
        </IonNote>
      )}
      <AppButton
        label={view.submitLabel}
        tone="primary"
        type="submit"
        testId={TEST_IDS.ruleFormSubmit}
        disabled={!view.canSubmit}
        loading={view.isSaving}
      />
    </StandingsDialogForm>
  );
}
