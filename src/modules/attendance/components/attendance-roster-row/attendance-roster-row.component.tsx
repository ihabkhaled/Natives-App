import { IonCard, IonCardContent } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { AttendanceRowActions } from '../attendance-row-actions';
import { AttendanceRowEditor } from '../attendance-row-editor';
import { AttendanceRowIdentity } from '../attendance-row-identity';
import type { AttendanceRosterRowProps } from './attendance-roster-row.types';

export function AttendanceRosterRow(props: AttendanceRosterRowProps): React.JSX.Element {
  const { row } = props;
  return (
    <IonCard
      data-testid={TEST_IDS.attendanceRosterRow}
      className={`m-0 overflow-visible rounded-2xl ${
        row.conflictMessage === null
          ? 'border border-[color:var(--ion-color-light-shade)]'
          : 'border-2 border-[color:var(--ion-color-danger)]'
      }`}
    >
      <IonCardContent className="grid gap-3 lg:grid-cols-[minmax(13rem,1fr)_minmax(15rem,1.4fr)]">
        <AttendanceRowIdentity row={row} onToggle={props.onToggle} />
        <AttendanceRowEditor
          row={row}
          isBusy={props.isBusy}
          onStatusChange={props.onStatusChange}
          onLatenessChange={props.onLatenessChange}
          onExcuseChange={props.onExcuseChange}
          onCorrectionReasonChange={props.onCorrectionReasonChange}
        />
        <AttendanceRowActions
          row={row}
          resolveConflictLabel={props.resolveConflictLabel}
          isBusy={props.isBusy}
          onResolveConflict={props.onResolveConflict}
          onShowHistory={props.onShowHistory}
          onSaveCorrection={props.onSaveCorrection}
        />
      </IonCardContent>
    </IonCard>
  );
}
