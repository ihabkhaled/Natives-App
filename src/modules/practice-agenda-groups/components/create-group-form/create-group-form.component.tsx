import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, SelectField } from '@/shared/ui';

import type { CreateGroupFormProps } from './create-group-form.types';

/** Start a new group. Every field is optional except the name. */
export function CreateGroupForm(props: CreateGroupFormProps): React.JSX.Element {
  return (
    <section
      aria-label={props.heading}
      data-testid={TEST_IDS.practiceAgendaGroupsCreateForm}
      className="app-section-panel flex flex-col gap-2"
    >
      <h2 className="app-section-panel__title m-0">{props.heading}</h2>
      <AppInput
        label={props.nameLabel}
        name="agenda-group-name"
        value={props.nameValue}
        testId={TEST_IDS.practiceAgendaGroupsCreateName}
        onValueChange={props.onNameChange}
      />
      <SelectField
        label={props.colorLabel}
        value={props.colorValue}
        options={props.colorOptions}
        testId={TEST_IDS.practiceAgendaGroupsCreateColor}
        onChange={props.onColorChange}
      />
      <AppInput
        label={props.coachLabel}
        name="agenda-group-coach"
        value={props.coachValue}
        testId={TEST_IDS.practiceAgendaGroupsCreateCoach}
        onValueChange={props.onCoachChange}
      />
      <AppInput
        label={props.notesLabel}
        name="agenda-group-notes"
        value={props.notesValue}
        testId={TEST_IDS.practiceAgendaGroupsCreateNotes}
        onValueChange={props.onNotesChange}
      />
      <AppButton
        label={props.submitLabel}
        tone="primary"
        disabled={!props.canSubmit}
        loading={props.isSaving}
        testId={TEST_IDS.practiceAgendaGroupsCreateSubmit}
        onClick={props.onSubmit}
      />
    </section>
  );
}
