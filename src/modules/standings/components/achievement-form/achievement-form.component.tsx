import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppDateField, AppInput, SelectField } from '@/shared/ui';

import { ACHIEVED_ON_DATETIME_ID } from './achievement-form.constants';
import type { AchievementFormProps } from './achievement-form.types';

/**
 * Author a draft claim. Visibility defaults to `team` and its helper text
 * explains the consequence: `public` reaches the trophy cabinet once
 * approved; `staff` never does.
 */
export function AchievementForm(props: AchievementFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <form
      data-testid={TEST_IDS.achievementForm}
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
        testId={TEST_IDS.achievementFormTitle}
        label={view.titleLabel}
        name="achievement-title"
        value={view.titleValue}
        onValueChange={view.onTitleChange}
      />
      <SelectField
        testId={TEST_IDS.achievementFormCategory}
        label={view.categoryLabel}
        value={view.categoryValue}
        options={view.categoryOptions}
        onChange={view.onCategoryChange}
      />
      <AppDateField
        label={view.dateLabel}
        datetimeId={ACHIEVED_ON_DATETIME_ID}
        value={view.dateValue}
        displayValue={view.dateDisplayValue}
        placeholder={view.datePlaceholder}
        openLabel={view.dateOpenLabel}
        dialogTitle={view.dateDialogTitle}
        closeLabel={view.dateCloseLabel}
        isOpen={view.isDateOpen}
        onOpen={view.onDateOpen}
        onDismiss={view.onDateDismiss}
        onValueChange={view.onDateChange}
        testId={TEST_IDS.achievementFormDate}
      />
      <SelectField
        label={view.memberLabel}
        value={view.memberValue}
        options={view.memberOptions}
        onChange={view.onMemberChange}
      />
      <AppInput
        label={view.descriptionLabel}
        name="achievement-description"
        value={view.descriptionValue}
        onValueChange={view.onDescriptionChange}
      />
      <AppInput
        label={view.evidenceLabel}
        name="achievement-evidence"
        value={view.evidenceValue}
        onValueChange={view.onEvidenceChange}
      />
      <SelectField
        testId={TEST_IDS.achievementFormVisibility}
        label={view.visibilityLabel}
        value={view.visibilityValue}
        options={view.visibilityOptions}
        onChange={view.onVisibilityChange}
      />
      <IonNote>{view.visibilityHint}</IonNote>
      {view.validationMessage === null ? null : (
        <IonNote color="danger" role="alert" data-testid={TEST_IDS.achievementFormError}>
          {view.validationMessage}
        </IonNote>
      )}
      <div className="app-standings-dialog__actions">
        <AppButton
          label={view.submitLabel}
          tone="primary"
          type="submit"
          testId={TEST_IDS.achievementFormSubmit}
          disabled={!view.canSubmit}
          loading={view.isSaving}
        />
        <AppButton
          label={view.cancelLabel}
          tone="ghost"
          testId={TEST_IDS.achievementFormCancel}
          onClick={view.onCancel}
        />
      </div>
    </form>
  );
}
