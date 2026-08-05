import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { ScheduleFormPatternFields } from '../schedule-form-pattern-fields';
import { ScheduleFormWindowFields } from '../schedule-form-window-fields';
import type { ScheduleFormProps } from './schedule-form.types';

/**
 * The recurring-pattern form: identity and cadence, then the generation
 * window and the defaults new sessions inherit. Split into two field groups
 * so no single component carries all twelve fields, but it is still one
 * form and one submit — there is no sub-entity here to warrant its own
 * container.
 */
export function ScheduleForm(props: ScheduleFormProps): React.JSX.Element {
  return (
    <form
      onSubmit={props.onSubmit}
      noValidate
      className="flex flex-col gap-4"
      data-testid={TEST_IDS.practiceScheduleForm}
    >
      <ScheduleFormPatternFields {...props} />
      <ScheduleFormWindowFields {...props} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <AppButton
          label={props.saveLabel}
          type="submit"
          tone="primary"
          loading={props.isSaving}
          testId={TEST_IDS.practiceScheduleSave}
        />
      </div>
    </form>
  );
}
