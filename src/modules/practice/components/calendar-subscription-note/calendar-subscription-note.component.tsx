import { APP_ICONS } from '@/packages/icons';
import { IonIcon, IonNote, IonText } from '@/packages/ionic';

import type { CalendarSubscriptionNoteProps } from './calendar-subscription-note.types';

/** Safe calendar-subscription guidance; never exposes private coach notes. */
export function CalendarSubscriptionNote(props: CalendarSubscriptionNoteProps): React.JSX.Element {
  return (
    <section
      data-testid={props.testId}
      aria-label={props.heading}
      className="flex flex-col gap-1 rounded-lg border border-[color:var(--ion-color-step-150)] p-3"
    >
      <div className="flex items-center gap-2">
        <IonIcon icon={APP_ICONS.information} aria-hidden="true" />
        <IonText>
          <h3 className="m-0 text-sm font-semibold">{props.heading}</h3>
        </IonText>
      </div>
      <IonNote className="text-sm">{props.body}</IonNote>
    </section>
  );
}
