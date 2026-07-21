import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppDateField, AppInput, SectionPanel, SelectField } from '@/shared/ui';

import { AdminSlugField } from '../admin-slug-field';

import { SEASON_END_DATETIME_ID, SEASON_START_DATETIME_ID } from './season-editor-form.constants';
import type { SeasonEditorFormProps } from './season-editor-form.types';

/**
 * Create or edit a season. Both dates use the design system's date picker, so
 * "starts on" and "ends on" read as calendars rather than as free text.
 */
export function SeasonEditorForm(props: SeasonEditorFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.seasonEditorForm}>
      <AdminSlugField field={view.slug} name="season-slug" testId={TEST_IDS.seasonEditorSlug} />
      <AppInput
        testId={TEST_IDS.seasonEditorName}
        label={view.name.label}
        name="season-name"
        value={view.name.value}
        onValueChange={view.name.onChange}
        errorMessage={view.name.error ?? undefined}
      />
      <AppDateField
        label={view.startsOn.label}
        datetimeId={SEASON_START_DATETIME_ID}
        value={view.startsOn.value}
        displayValue={view.startsOn.displayValue}
        placeholder={view.datePlaceholder}
        openLabel={view.dateOpenLabel}
        dialogTitle={view.dateDialogTitle}
        closeLabel={view.dateCloseLabel}
        isOpen={view.startsOn.isOpen}
        onOpen={view.startsOn.onOpen}
        onDismiss={view.startsOn.onDismiss}
        onValueChange={view.startsOn.onChange}
        errorMessage={view.startsOn.error ?? undefined}
        testId={TEST_IDS.seasonEditorStartsOn}
        inputTestId={TEST_IDS.seasonEditorStartsOnInput}
      />
      <AppDateField
        label={view.endsOn.label}
        datetimeId={SEASON_END_DATETIME_ID}
        value={view.endsOn.value}
        displayValue={view.endsOn.displayValue}
        placeholder={view.datePlaceholder}
        openLabel={view.dateOpenLabel}
        dialogTitle={view.dateDialogTitle}
        closeLabel={view.dateCloseLabel}
        isOpen={view.endsOn.isOpen}
        onOpen={view.endsOn.onOpen}
        onDismiss={view.endsOn.onDismiss}
        onValueChange={view.endsOn.onChange}
        errorMessage={view.endsOn.error ?? undefined}
        testId={TEST_IDS.seasonEditorEndsOn}
        inputTestId={TEST_IDS.seasonEditorEndsOnInput}
      />
      <SelectField
        testId={TEST_IDS.seasonEditorStatus}
        label={view.statusLabel}
        value={view.statusValue}
        options={view.statusOptions}
        onChange={view.onStatusChange}
      />
      <IonNote className="app-member-form__hint">{view.statusHint}</IonNote>
      <div className="app-member-form__actions flex gap-2">
        <AppButton
          testId={TEST_IDS.seasonEditorCancel}
          label={view.cancelLabel}
          tone="secondary"
          onClick={view.onCancel}
        />
        <AppButton
          testId={TEST_IDS.seasonEditorSubmit}
          label={view.submitLabel}
          tone="primary"
          loading={view.isSaving}
          onClick={view.onSubmit}
        />
      </div>
    </SectionPanel>
  );
}
