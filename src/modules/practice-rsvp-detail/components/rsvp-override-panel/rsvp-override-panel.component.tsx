import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, ReasonField, SectionPanel, SelectField } from '@/shared/ui';

import type { RsvpOverridePanelProps } from './rsvp-override-panel.types';

/**
 * The override form for one member.
 *
 * `onSubmit` runs the hook's confirm-then-mutate flow — this component never
 * calls the mutation directly, so an override can never fire without the
 * confirmation an answer changed on somebody's behalf requires.
 */
export function RsvpOverridePanel(props: RsvpOverridePanelProps): React.JSX.Element {
  return (
    <SectionPanel heading={props.headingLabel} testId={TEST_IDS.practiceRsvpDetailOverridePanel}>
      <div className="flex flex-col gap-3">
        <SelectField
          label={props.statusLabel}
          value={props.status}
          options={props.statusOptions}
          onChange={props.onStatusChange}
          testId={TEST_IDS.practiceRsvpDetailOverrideStatus}
        />
        <ReasonField
          label={props.reasonLabel}
          placeholder={props.reasonPlaceholder}
          value={props.reason}
          validationMessage={props.reasonValidationMessage}
          onChange={props.onReasonChange}
          testId={TEST_IDS.practiceRsvpDetailOverrideReason}
        />
        <SelectField
          label={props.reasonCategoryLabel}
          value={props.reasonCategory}
          options={props.reasonCategoryOptions}
          onChange={props.onReasonCategoryChange}
          testId={TEST_IDS.practiceRsvpDetailOverrideReasonCategory}
        />
        <AppInput
          label={props.noteLabel}
          name="rsvp-override-note"
          value={props.note}
          onValueChange={props.onNoteChange}
          testId={TEST_IDS.practiceRsvpDetailOverrideNote}
        />
        <SelectField
          label={props.noteVisibilityLabel}
          value={props.noteVisibility}
          options={props.noteVisibilityOptions}
          onChange={props.onNoteVisibilityChange}
          testId={TEST_IDS.practiceRsvpDetailOverrideNoteVisibility}
        />
        <div className="flex gap-2">
          <AppButton
            disabled={!props.canSubmit}
            label={props.submitLabel}
            loading={props.isSubmitting}
            onClick={props.onSubmit}
            testId={TEST_IDS.practiceRsvpDetailOverrideSubmit}
            tone="primary"
          />
          <AppButton
            disabled={props.isSubmitting}
            label={props.cancelLabel}
            onClick={props.onCancel}
            testId={TEST_IDS.practiceRsvpDetailOverrideCancel}
            tone="ghost"
          />
        </div>
      </div>
    </SectionPanel>
  );
}
