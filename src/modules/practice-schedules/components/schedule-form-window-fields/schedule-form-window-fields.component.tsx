import { TEST_IDS } from '@/shared/config';
import { AppInput, ReasonField, SelectField } from '@/shared/ui';

import type { ScheduleFormWindowFieldsProps } from './schedule-form-window-fields.types';

/** When to generate through, who can see a session, and its defaults. */
export function ScheduleFormWindowFields(
  props: ScheduleFormWindowFieldsProps,
): React.JSX.Element {
  return (
    <>
      <AppInput
        label={props.generationStartLabel}
        name={props.generationStartField.name}
        placeholder="YYYY-MM-DD"
        value={props.generationStartField.value}
        onValueChange={props.generationStartField.onChange}
        onBlur={props.generationStartField.onBlur}
        errorMessage={props.generationStartField.errorMessage}
        testId={TEST_IDS.practiceScheduleGenerationStartInput}
      />
      <AppInput
        label={props.generationUntilLabel}
        name={props.generationUntilField.name}
        placeholder="YYYY-MM-DD"
        value={props.generationUntilField.value}
        onValueChange={props.generationUntilField.onChange}
        onBlur={props.generationUntilField.onBlur}
        errorMessage={props.generationUntilField.errorMessage}
        testId={TEST_IDS.practiceScheduleGenerationUntilInput}
      />
      <SelectField
        label={props.visibilityLabel}
        value={props.visibilityValue}
        options={props.visibilityOptions}
        onChange={props.onVisibilityChange}
        testId={TEST_IDS.practiceScheduleVisibilitySelect}
      />
      <AppInput
        label={props.capacityLabel}
        name={props.capacityField.name}
        type="number"
        value={props.capacityField.value}
        onValueChange={props.capacityField.onChange}
        onBlur={props.capacityField.onBlur}
        errorMessage={props.capacityField.errorMessage}
        testId={TEST_IDS.practiceScheduleCapacityInput}
      />
      <ReasonField
        label={props.notesLabel}
        placeholder=""
        value={props.notesField.value}
        validationMessage={props.notesField.errorMessage ?? null}
        onChange={props.notesField.onChange}
        testId={TEST_IDS.practiceScheduleNotesInput}
      />
    </>
  );
}
