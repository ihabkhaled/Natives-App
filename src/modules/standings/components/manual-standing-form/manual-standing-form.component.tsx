import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, ReasonField, SelectField } from '@/shared/ui';

import type { ManualStandingFormProps } from './manual-standing-form.types';

/**
 * The reconciled external-row form. Counts are cross-checked client-side
 * (wins + losses + ties = played), blank spirit stays "not scored", and the
 * mandatory reconciliation note is the provenance the backend will refuse to
 * accept the row without.
 */
export function ManualStandingForm(props: ManualStandingFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <form
      data-testid={TEST_IDS.standingsManualForm}
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
      <IonNote>{view.intro}</IonNote>
      <SelectField
        label={view.entrantLabel}
        value={view.entrantValue}
        options={view.entrantOptions}
        onChange={view.onEntrantChange}
      />
      <div className="app-standings-dialog__grid">
        {view.countFields.map((field) => (
          <AppInput
            key={field.id}
            label={field.label}
            name={field.id}
            type="number"
            value={field.value}
            onValueChange={field.onChange}
          />
        ))}
        {view.scoreFields.map((field) => (
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
      <AppInput
        label={view.spiritField.label}
        name={view.spiritField.id}
        value={view.spiritField.value}
        onValueChange={view.spiritField.onChange}
      />
      <IonNote>{view.spiritHint}</IonNote>
      <AppInput
        label={view.referenceField.label}
        name={view.referenceField.id}
        value={view.referenceField.value}
        onValueChange={view.referenceField.onChange}
      />
      <SelectField
        label={view.ruleLabel}
        value={view.ruleValue}
        options={view.ruleOptions}
        onChange={view.onRuleChange}
      />
      <ReasonField
        testId={TEST_IDS.standingsManualNote}
        label={view.noteLabel}
        placeholder={view.noteHint}
        value={view.noteValue}
        validationMessage={view.validationMessage}
        onChange={view.onNoteChange}
      />
      <div className="app-standings-dialog__actions">
        <AppButton
          label={view.submitLabel}
          tone="primary"
          type="submit"
          testId={TEST_IDS.standingsManualSubmit}
          disabled={!view.canSubmit}
          loading={view.isSaving}
        />
        <AppButton
          label={view.cancelLabel}
          tone="ghost"
          testId={TEST_IDS.standingsManualCancel}
          onClick={view.onCancel}
        />
      </div>
    </form>
  );
}
