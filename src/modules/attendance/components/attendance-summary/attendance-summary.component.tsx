import { IonBadge, IonCard, IonCardContent, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { AttendanceSummaryProps } from './attendance-summary.types';

/**
 * The roster header: the one bold turf-lime surface on the attendance screen,
 * always carrying near-black ink so the copy stays AA legible on the gradient.
 */
export function AttendanceSummary(props: AttendanceSummaryProps): React.JSX.Element {
  return (
    <IonCard data-testid={TEST_IDS.attendanceSummary} className="app-attendance-summary m-0">
      <IonCardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <IonText>
            <h2 className="m-0 text-2xl font-black tracking-tight">{props.subtitle}</h2>
          </IonText>
          <p className="mb-0 mt-1">{props.sessionLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <IonBadge>{props.sheetStateLabel}</IonBadge>
          <IonBadge>{props.rosterSummary}</IonBadge>
          <IonBadge>{props.queueSummary}</IonBadge>
        </div>
        {props.finalizedLabel === null ? null : (
          <IonNote className="md:col-span-2">{props.finalizedLabel}</IonNote>
        )}
      </IonCardContent>
    </IonCard>
  );
}
