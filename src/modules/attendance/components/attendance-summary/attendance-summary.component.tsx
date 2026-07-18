import { IonBadge, IonCard, IonCardContent, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { AttendanceSummaryProps } from './attendance-summary.types';

export function AttendanceSummary(props: AttendanceSummaryProps): React.JSX.Element {
  return (
    <IonCard
      data-testid={TEST_IDS.attendanceSummary}
      className="m-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--ion-color-primary)] to-[color:var(--ion-color-tertiary)] text-white shadow-lg"
    >
      <IonCardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <IonText color="light">
            <h1 className="m-0 text-2xl font-black tracking-tight">{props.subtitle}</h1>
          </IonText>
          <p className="mb-0 mt-1 opacity-90">{props.sessionLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <IonBadge color="light">{props.sheetStateLabel}</IonBadge>
          <IonBadge color="light">{props.rosterSummary}</IonBadge>
          <IonBadge color="light">{props.queueSummary}</IonBadge>
        </div>
        {props.finalizedLabel === null ? null : (
          <IonNote color="light" className="md:col-span-2">
            {props.finalizedLabel}
          </IonNote>
        )}
      </IonCardContent>
    </IonCard>
  );
}
