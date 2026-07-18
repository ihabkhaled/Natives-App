import { IonList, IonListHeader, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { PracticeSessionCard } from '../practice-session-card';
import type { PracticeDaySectionProps } from './practice-day-section.types';

/** A Cairo-day agenda group: a date header with that day's session cards. */
export function PracticeDaySection(props: PracticeDaySectionProps): React.JSX.Element {
  const { section } = props;
  return (
    <section data-testid={TEST_IDS.practiceDaySection} aria-label={section.dayLabel}>
      <IonListHeader>
        <IonText>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wide">{section.dayLabel}</h2>
        </IonText>
      </IonListHeader>
      <IonList>
        {section.sessions.map((card) => (
          <PracticeSessionCard key={card.id} card={card} onSelect={props.onSelectSession} />
        ))}
      </IonList>
    </section>
  );
}
