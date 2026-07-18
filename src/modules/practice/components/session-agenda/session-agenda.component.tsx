import { IonItem, IonLabel, IonList, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { SessionAgendaProps } from './session-agenda.types';

/** Agenda preview: drill/segment labels with optional durations. */
export function SessionAgenda(props: SessionAgendaProps): React.JSX.Element {
  return (
    <section data-testid={TEST_IDS.practiceSessionAgenda} aria-label={props.heading}>
      <IonText>
        <h2 className="m-0 mb-1 text-base font-semibold">{props.heading}</h2>
      </IonText>
      {props.items.length === 0 ? (
        <IonNote>{props.emptyLabel}</IonNote>
      ) : (
        <IonList>
          {props.items.map((item) => (
            <IonItem key={item.id} lines="none">
              <IonLabel className="whitespace-normal">{item.label}</IonLabel>
              {item.durationLabel === null ? null : (
                <IonNote slot="end">{item.durationLabel}</IonNote>
              )}
            </IonItem>
          ))}
        </IonList>
      )}
    </section>
  );
}
