import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { AttendanceActionBarProps } from './attendance-action-bar.types';

export function AttendanceActionBar(props: AttendanceActionBarProps): React.JSX.Element {
  return (
    <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-2 rounded-2xl border bg-[color:var(--ion-background-color)] p-3 shadow-xl">
      {props.canRetryQueue ? (
        <AppButton
          label={props.retryQueueLabel}
          tone="secondary"
          testId={TEST_IDS.attendanceRetryQueue}
          onClick={props.onRetryQueue}
        />
      ) : null}
      <AppButton
        label={props.saveLabel}
        disabled={!props.canSubmit}
        loading={props.isSubmitting}
        testId={TEST_IDS.attendanceSubmit}
        onClick={props.onSubmit}
      />
      <AppButton
        label={props.finalizeLabel}
        tone="danger"
        disabled={!props.canFinalize}
        loading={props.isFinalizing}
        testId={TEST_IDS.attendanceFinalize}
        onClick={props.onFinalize}
      />
    </div>
  );
}
