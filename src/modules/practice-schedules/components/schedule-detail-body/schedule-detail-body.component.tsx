import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import { ScheduleForm } from '../schedule-form';
import type { ScheduleDetailBodyProps } from './schedule-detail-body.types';

/**
 * The loaded detail body: the pattern's status, its editable form, and the
 * two actions that reach past the record itself — delete and generate.
 *
 * The outcome list is a live region: a coach who presses "generate" is
 * usually looking at the calendar next, not the button, so the result is
 * announced rather than only rendered.
 */
export function ScheduleDetailBody(props: ScheduleDetailBodyProps): React.JSX.Element {
  return (
    <>
      {props.isCreateMode ? null : (
        <StatusChip
          label={props.statusLabel}
          tone="medium"
          testId={TEST_IDS.practiceScheduleStatus}
        />
      )}

      <ScheduleForm {...props.form} />

      {props.isCreateMode ? null : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <AppButton
            disabled={!props.canGenerate}
            label={props.generateLabel}
            loading={props.isGenerating}
            onClick={props.onGenerate}
            testId={TEST_IDS.practiceScheduleGenerate}
            tone="secondary"
          />
          <AppButton
            disabled={!props.canDelete}
            label={props.deleteLabel}
            loading={props.isDeleting}
            onClick={props.onDelete}
            testId={TEST_IDS.practiceScheduleDelete}
            tone="danger"
          />
        </div>
      )}

      {props.messages.length === 0 ? null : (
        // The live region is the wrapper, not the list: putting role="status"
        // on the <ul> overrides its list role and orphans every <li>.
        <div data-testid={TEST_IDS.practiceScheduleMessages} role="status">
          <ul className="m-0 flex flex-col gap-1 p-0">
            {props.messages.map((message) => (
              <li className="app-pending-notice text-sm" key={message.id}>
                <IonText>{message.text}</IonText>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
