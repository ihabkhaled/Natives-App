import { IonSelect, IonSelectOption } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput } from '@/shared/ui';

import type { AttendanceExcuse, AttendanceStatus } from '../../constants/attendance.constants';
import { ATTENDANCE_EXCUSE_NONE_VALUE } from './attendance-row-editor.constants';
import type { AttendanceRowEditorProps } from './attendance-row-editor.types';

export function AttendanceRowEditor(props: AttendanceRowEditorProps): React.JSX.Element {
  const { row } = props;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <IonSelect
        data-testid={TEST_IDS.attendanceStatusSelect}
        label={row.statusLabel}
        labelPlacement="stacked"
        fill="outline"
        value={row.status}
        disabled={props.isBusy}
        onIonChange={(event) => {
          props.onStatusChange(row.membershipId, event.detail.value as AttendanceStatus);
        }}
      >
        {row.statusOptions.map((option) => (
          <IonSelectOption key={option.value} value={option.value}>
            {option.label}
          </IonSelectOption>
        ))}
      </IonSelect>
      {row.showLateness ? (
        <AppInput
          label={row.latenessLabel}
          name={`lateness-${row.membershipId}`}
          value={row.latenessMinutes}
          testId={TEST_IDS.attendanceLatenessInput}
          onValueChange={(value) => {
            props.onLatenessChange(row.membershipId, value);
          }}
        />
      ) : null}
      {row.showExcuse ? (
        <IonSelect
          data-testid={TEST_IDS.attendanceExcuseSelect}
          label={row.excuseLabel}
          labelPlacement="stacked"
          fill="outline"
          value={row.excuseCategory ?? ATTENDANCE_EXCUSE_NONE_VALUE}
          disabled={props.isBusy}
          onIonChange={(event) => {
            const value = event.detail.value as string;
            props.onExcuseChange(
              row.membershipId,
              value === ATTENDANCE_EXCUSE_NONE_VALUE ? null : (value as AttendanceExcuse),
            );
          }}
        >
          <IonSelectOption value={ATTENDANCE_EXCUSE_NONE_VALUE}>
            {row.excuseNoneLabel}
          </IonSelectOption>
          {row.excuseOptions.map((option) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      ) : null}
      {row.isLocked ? (
        <AppInput
          label={row.correctionReasonLabel}
          name={`correction-${row.membershipId}`}
          value={row.correctionReason}
          placeholder={row.correctionReasonPlaceholder}
          testId={TEST_IDS.attendanceCorrectionReason}
          onValueChange={(value) => {
            props.onCorrectionReasonChange(row.membershipId, value);
          }}
        />
      ) : null}
    </div>
  );
}
