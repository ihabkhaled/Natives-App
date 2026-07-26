import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import { TieBreakOrderBuilder } from '../tie-break-order-builder';
import type { RuleVersionFormProps } from './rule-version-form.types';

/**
 * Publish version N+1 of a rule family. Nothing here edits an existing
 * version — submitting always creates the next immutable version, which the
 * list then highlights.
 */
export function RuleVersionForm(props: RuleVersionFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <form
      data-testid={TEST_IDS.ruleForm}
      aria-label={view.heading}
      className="app-surface-card app-standings-dialog"
      onSubmit={(event) => {
        event.preventDefault();
        view.onSubmit();
      }}
    >
      <IonText>
        <h3 className="app-standings-dialog__title m-0">{view.heading}</h3>
      </IonText>
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
        {view.pointFields.map((field) => (
          <AppInput
            key={field.id}
            label={field.label}
            name={field.id}
            type="number"
            value={field.value}
            onValueChange={field.onChange}
          />
        ))}
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
    </form>
  );
}
