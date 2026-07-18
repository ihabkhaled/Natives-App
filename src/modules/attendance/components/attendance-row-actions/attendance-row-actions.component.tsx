import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { AttendanceRowActionsProps } from './attendance-row-actions.types';

export function AttendanceRowActions(props: AttendanceRowActionsProps): React.JSX.Element {
  const { row } = props;
  return (
    <>
      {row.conflictMessage === null ? null : (
        <div
          role="alert"
          data-testid={TEST_IDS.attendanceConflict}
          className="rounded-xl bg-[color:rgba(var(--ion-color-danger-rgb),0.1)] p-3 lg:col-span-2"
        >
          <IonNote color="danger">{row.conflictMessage}</IonNote>
          <AppButton
            label={props.resolveConflictLabel}
            tone="danger"
            testId={TEST_IDS.attendanceResolveConflict}
            onClick={() => {
              props.onResolveConflict(row.membershipId);
            }}
          />
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
        <AppButton
          label={row.historyLabel}
          tone="secondary"
          testId={TEST_IDS.attendanceHistoryButton}
          onClick={() => {
            props.onShowHistory(row.membershipId);
          }}
        />
        {row.isLocked ? (
          <AppButton
            label={row.saveCorrectionLabel}
            disabled={!row.canSaveCorrection || props.isBusy}
            loading={props.isBusy}
            testId={TEST_IDS.attendanceSaveCorrection}
            onClick={() => {
              props.onSaveCorrection(row.membershipId);
            }}
          />
        ) : null}
      </div>
    </>
  );
}
