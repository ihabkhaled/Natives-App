import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { RsvpHistoryPanelProps } from './rsvp-history-panel.types';

/**
 * One member's full revision trail — the reason the override endpoint is
 * trustworthy is that this stays visible after an override runs, so a change
 * to somebody's answer is always attributable rather than a silent overwrite.
 */
export function RsvpHistoryPanel(props: RsvpHistoryPanelProps): React.JSX.Element {
  return (
    <IonCard
      data-testid={TEST_IDS.practiceRsvpDetailHistoryPanel}
      className="m-0 rounded-2xl border border-[color:var(--ion-color-light-shade)]"
      aria-busy={props.isLoading}
    >
      <IonCardHeader>
        <IonCardTitle>{props.headingLabel}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="flex flex-col gap-3">
        {props.isLoading ? <IonNote>{props.loadingLabel}</IonNote> : null}
        {!props.isLoading && props.items.length === 0 ? <IonNote>{props.emptyLabel}</IonNote> : null}
        <ol className="m-0 grid list-none gap-3 p-0">
          {props.items.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl bg-[color:var(--ion-color-light)] p-3"
              data-testid={TEST_IDS.practiceRsvpDetailHistoryItem}
            >
              <p className="m-0 font-semibold">{entry.transitionLabel}</p>
              <IonNote className="block">{entry.occurredLabel}</IonNote>
              <IonNote className="block">{entry.attributionLabel}</IonNote>
              {entry.reasonLabel === null ? null : (
                <p className="mb-0 mt-2 whitespace-pre-wrap text-sm">{entry.reasonLabel}</p>
              )}
              {entry.noteLabel === null ? null : (
                <p className="mb-0 mt-1 whitespace-pre-wrap text-sm">{entry.noteLabel}</p>
              )}
            </li>
          ))}
        </ol>
        <AppButton
          label={props.closeLabel}
          onClick={props.onClose}
          testId={TEST_IDS.practiceRsvpDetailHistoryClose}
          tone="ghost"
        />
      </IonCardContent>
    </IonCard>
  );
}
