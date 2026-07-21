import { IonInput, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { SettingVersionFormProps } from './setting-version-form.types';

/** Schedules an effective-dated change. Never edits an existing version. */
export function SettingVersionForm(props: SettingVersionFormProps): React.JSX.Element {
  return (
    <SectionPanel
      heading={props.heading}
      intro={props.intro}
      notice={props.validationMessage}
      testId={TEST_IDS.adminVersionForm}
    >
      <IonInput
        data-testid={TEST_IDS.adminVersionEffectiveFrom}
        label={props.effectiveFromLabel}
        value={props.effectiveFromValue}
        onIonInput={(event) => {
          props.onEffectiveFromChange(event.detail.value ?? '');
        }}
      />
      <IonTextarea
        data-testid={TEST_IDS.adminVersionValue}
        label={props.valueLabel}
        value={props.valueValue}
        autoGrow
        onIonInput={(event) => {
          props.onValueChange(event.detail.value ?? '');
        }}
      />
      <IonTextarea
        data-testid={TEST_IDS.adminVersionNote}
        label={props.noteLabel}
        value={props.noteValue}
        autoGrow
        onIonInput={(event) => {
          props.onNoteChange(event.detail.value ?? '');
        }}
      />
      <AppButton
        label={props.submitLabel}
        tone="primary"
        loading={props.isSaving}
        disabled={!props.canSubmit}
        testId={TEST_IDS.adminVersionSubmit}
        onClick={props.onSubmit}
      />
    </SectionPanel>
  );
}
