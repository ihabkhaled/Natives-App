import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { AttendanceHistoryPanelProps } from './attendance-history-panel.types';

export function AttendanceHistoryPanel(props: AttendanceHistoryPanelProps): React.JSX.Element {
  return (
    <IonCard
      data-testid={TEST_IDS.attendanceHistoryPanel}
      className="m-0 rounded-2xl border border-[color:var(--ion-color-light-shade)]"
      aria-busy={props.isHistoryLoading}
    >
      <IonCardHeader>
        <IonCardTitle>{props.historyTitle}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {props.isHistoryLoading ? <IonNote>{props.historyLoadingLabel}</IonNote> : null}
        {!props.isHistoryLoading &&
        props.historyMembershipId !== null &&
        props.historyItems.length === 0 ? (
          <IonNote>{props.historyEmptyLabel}</IonNote>
        ) : null}
        <ol className="m-0 grid list-none gap-3 p-0">
          {props.historyItems.map((revision) => (
            <li key={revision.id} className="rounded-xl bg-[color:var(--ion-color-light)] p-3">
              <p className="m-0 font-semibold">{revision.transitionLabel}</p>
              <IonNote className="block">{revision.occurredLabel}</IonNote>
              {revision.reason === null ? null : (
                <p className="mb-0 mt-2 whitespace-pre-wrap text-sm">{revision.reason}</p>
              )}
            </li>
          ))}
        </ol>
      </IonCardContent>
    </IonCard>
  );
}
