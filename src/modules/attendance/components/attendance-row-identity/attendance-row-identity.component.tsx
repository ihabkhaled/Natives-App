import { IonBadge, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { AttendanceRowIdentityProps } from './attendance-row-identity.types';

export function AttendanceRowIdentity(props: AttendanceRowIdentityProps): React.JSX.Element {
  const { row } = props;
  const syncColor =
    row.queueState === 'conflict' || row.queueState === 'failed'
      ? 'danger'
      : row.queueState === null
        ? 'success'
        : 'warning';
  return (
    <div className="flex min-w-0 items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 h-11 w-11 shrink-0 accent-[color:var(--ion-color-primary)]"
        data-testid={TEST_IDS.attendancePlayerSelect}
        aria-label={row.selectLabel}
        checked={row.isSelected}
        onChange={() => {
          props.onToggle(row.membershipId);
        }}
      />
      <div className="min-w-0">
        <IonText>
          <h2 className="m-0 text-base font-bold">{row.playerLabel}</h2>
        </IonText>
        <IonNote className="block font-mono text-xs">{row.memberIdentifierLabel}</IonNote>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusChip
            label={row.rsvpLabel}
            tone={row.rsvpTone}
            testId={TEST_IDS.attendanceRsvpChip}
          />
          {row.isHistorical ? <IonBadge color="medium">{row.historicalLabel}</IonBadge> : null}
          <IonBadge color={syncColor}>{row.syncLabel}</IonBadge>
        </div>
      </div>
    </div>
  );
}
