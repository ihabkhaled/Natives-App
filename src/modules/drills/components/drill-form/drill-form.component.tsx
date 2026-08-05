import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, ReasonField, SectionPanel, SelectField } from '@/shared/ui';

import type { DrillFormProps } from './drill-form.types';

/** The ten fields a coach can write for a drill, plus save and cancel. */
export function DrillForm(props: DrillFormProps): React.JSX.Element {
  const { form } = props;
  return (
    <SectionPanel heading={form.heading}>
      <form
        onSubmit={form.onSubmit}
        noValidate
        className="flex flex-col gap-4"
        data-testid={TEST_IDS.drillForm}
      >
        <AppInput
          label={form.nameField.label}
          name={form.nameField.name}
          value={form.nameField.value}
          onValueChange={form.nameField.onChange}
          onBlur={form.nameField.onBlur}
          placeholder={form.nameField.placeholder}
          errorMessage={form.nameField.errorMessage}
          testId={TEST_IDS.drillNameInput}
        />
        <SelectField
          testId={TEST_IDS.drillCategorySelect}
          label={form.categoryField.label}
          value={form.categoryField.value}
          options={form.categoryField.options}
          onChange={form.categoryField.onChange}
        />
        <SelectField
          testId={TEST_IDS.drillIntensitySelect}
          label={form.intensityField.label}
          value={form.intensityField.value}
          options={form.intensityField.options}
          onChange={form.intensityField.onChange}
        />
        <ReasonField
          label={form.objectiveField.label}
          placeholder={form.objectiveField.placeholder}
          value={form.objectiveField.value}
          validationMessage={form.objectiveField.errorMessage ?? null}
          onChange={form.objectiveField.onChange}
          testId={TEST_IDS.drillObjectiveInput}
        />
        <ReasonField
          label={form.instructionsField.label}
          placeholder={form.instructionsField.placeholder}
          value={form.instructionsField.value}
          validationMessage={form.instructionsField.errorMessage ?? null}
          onChange={form.instructionsField.onChange}
          testId={TEST_IDS.drillInstructionsInput}
        />
        <AppInput
          label={form.equipmentField.label}
          name={form.equipmentField.name}
          value={form.equipmentField.value}
          onValueChange={form.equipmentField.onChange}
          onBlur={form.equipmentField.onBlur}
          placeholder={form.equipmentField.placeholder}
          errorMessage={form.equipmentField.errorMessage}
          testId={TEST_IDS.drillEquipmentInput}
        />
        <AppInput
          label={form.skillTagsField.label}
          name={form.skillTagsField.name}
          value={form.skillTagsField.value}
          onValueChange={form.skillTagsField.onChange}
          onBlur={form.skillTagsField.onBlur}
          placeholder={form.skillTagsField.placeholder}
          errorMessage={form.skillTagsField.errorMessage}
          testId={TEST_IDS.drillSkillTagsInput}
        />
        <AppInput
          label={form.durationField.label}
          name={form.durationField.name}
          value={form.durationField.value}
          onValueChange={form.durationField.onChange}
          onBlur={form.durationField.onBlur}
          placeholder={form.durationField.placeholder}
          errorMessage={form.durationField.errorMessage}
          type="number"
          testId={TEST_IDS.drillDurationInput}
        />
        <ReasonField
          label={form.safetyNotesField.label}
          placeholder={form.safetyNotesField.placeholder}
          value={form.safetyNotesField.value}
          validationMessage={form.safetyNotesField.errorMessage ?? null}
          onChange={form.safetyNotesField.onChange}
          testId={TEST_IDS.drillSafetyNotesInput}
        />
        <AppInput
          label={form.mediaUrlField.label}
          name={form.mediaUrlField.name}
          value={form.mediaUrlField.value}
          onValueChange={form.mediaUrlField.onChange}
          onBlur={form.mediaUrlField.onBlur}
          placeholder={form.mediaUrlField.placeholder}
          errorMessage={form.mediaUrlField.errorMessage}
          testId={TEST_IDS.drillMediaUrlInput}
        />
        <div className="app-drill-form__actions flex gap-2">
          <AppButton
            label={form.saveLabel}
            type="submit"
            loading={form.isSubmitting}
            testId={TEST_IDS.drillSaveButton}
          />
          <AppButton
            label={form.cancelLabel}
            tone="ghost"
            onClick={form.onCancel}
            testId={TEST_IDS.drillCancelButton}
          />
        </div>
      </form>
    </SectionPanel>
  );
}
