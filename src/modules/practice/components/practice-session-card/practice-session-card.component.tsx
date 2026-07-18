import { IonBadge, IonItem, IonLabel, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { PracticeSessionCardProps } from './practice-session-card.types';

/** One calendar list item: Cairo-time start, type, venue, RSVP, and changes. */
export function PracticeSessionCard(props: PracticeSessionCardProps): React.JSX.Element {
  const { card } = props;
  return (
    <IonItem
      button
      detail
      data-testid={TEST_IDS.practiceSessionCard}
      onClick={() => {
        props.onSelect(card.id);
      }}
    >
      <IonLabel className="app-practice-session-card__content whitespace-normal">
        <p className="app-practice-session-card__time m-0 text-sm font-semibold">
          {card.timeLabel}
        </p>
        <h3
          className={`app-practice-session-card__title m-0 text-base ${
            card.isCancelled ? 'line-through' : ''
          }`}
        >
          {card.title}
        </h3>
        <IonNote className="block text-sm">{card.typeLabel}</IonNote>
        {card.venueLabel === null ? null : (
          <IonNote className="block text-sm">{card.venueLabel}</IonNote>
        )}
        {card.changeLabel === null ? null : (
          <IonBadge color="warning" className="app-practice-session-card__change mt-1">
            {card.changeLabel}
          </IonBadge>
        )}
      </IonLabel>
      <div slot="end" className="app-practice-session-card__status flex flex-col items-end gap-1">
        <IonBadge color={card.rsvpTone}>{card.rsvpLabel}</IonBadge>
        {card.showStatusBadge ? (
          <IonBadge color={card.statusTone}>{card.statusLabel}</IonBadge>
        ) : null}
        {card.waitlistLabel === null ? null : (
          <IonNote className="text-xs">{card.waitlistLabel}</IonNote>
        )}
      </div>
    </IonItem>
  );
}
