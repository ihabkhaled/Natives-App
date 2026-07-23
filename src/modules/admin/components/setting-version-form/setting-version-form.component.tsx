import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppDateTimeField, ReasonField, SectionPanel } from '@/shared/ui';

import { RawJsonDisclosure } from '../raw-json-disclosure';
import { SettingEditorSwitch } from '../setting-editors/setting-editor-switch';
import type { SettingVersionFormProps } from './setting-version-form.types';

/**
 * Schedules an effective-dated change through the typed per-key editor —
 * the raw JSON textarea survives only as the platform-admin disclosure at
 * the bottom, validated through the same contract. Never edits history.
 */
export function SettingVersionForm(props: SettingVersionFormProps): React.JSX.Element {
  const form = props.form;
  return (
    <SectionPanel
      heading={form.heading}
      intro={form.intro}
      notice={form.validationMessage}
      testId={TEST_IDS.adminVersionForm}
    >
      <SettingEditorSwitch binding={form.editor} context={form.editorContext} />
      {form.validationIssues.length === 0 ? null : (
        <div role="alert" className="app-form-issues">
          <IonNote>{form.issuesHeading}</IonNote>
          <ul className="app-form-issues__list">
            {form.validationIssues.map((issue) => (
              <li key={issue} data-testid={TEST_IDS.adminVersionIssue}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
      <AppDateTimeField
        label={form.effectiveFrom.label}
        datetimeId={TEST_IDS.adminVersionEffectiveFrom}
        value={form.effectiveFrom.value}
        displayValue={form.effectiveFrom.displayValue}
        placeholder={form.effectiveFrom.placeholder}
        openLabel={form.effectiveFrom.openLabel}
        dialogTitle={form.effectiveFrom.dialogTitle}
        closeLabel={form.effectiveFrom.closeLabel}
        isOpen={form.effectiveFrom.isOpen}
        onOpen={form.effectiveFrom.onOpen}
        onDismiss={form.effectiveFrom.onDismiss}
        onValueChange={form.effectiveFrom.onChange}
        min={form.effectiveFrom.minWallTime}
        hint={form.effectiveFrom.hint}
        errorMessage={form.effectiveFrom.errorMessage ?? undefined}
        testId={TEST_IDS.adminVersionEffectiveFrom}
        inputTestId={TEST_IDS.adminVersionEffectiveInput}
      />
      <ReasonField
        label={form.noteLabel}
        placeholder={form.noteLabel}
        value={form.noteValue}
        onChange={form.onNoteChange}
        validationMessage={null}
        testId={TEST_IDS.adminVersionNote}
      />
      {form.rawJson === null ? null : <RawJsonDisclosure raw={form.rawJson} />}
      <AppButton
        label={form.submitLabel}
        tone="primary"
        loading={form.isSaving}
        disabled={!form.canSubmit}
        testId={TEST_IDS.adminVersionSubmit}
        onClick={form.onSubmit}
      />
    </SectionPanel>
  );
}
