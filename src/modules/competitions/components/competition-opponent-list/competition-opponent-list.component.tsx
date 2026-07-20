import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { CompetitionOpponentListProps } from './competition-opponent-list.types';

/** The opponent directory. Club contact details never reach the client. */
export function CompetitionOpponentList(props: CompetitionOpponentListProps): React.JSX.Element {
  return props.items.length === 0 ? (
    <IonNote>{props.emptyLabel}</IonNote>
  ) : (
    <ul data-testid={TEST_IDS.competitionOpponents} className="app-opponent-list">
      {props.items.map((opponent) => (
        <li key={opponent.id} data-testid={TEST_IDS.competitionOpponent}>
          <span className="app-opponent-list__name">{opponent.name}</span>
          {opponent.shortName === null ? null : <IonNote>{opponent.shortName}</IonNote>}
          <IonNote>{opponent.statusLabel}</IonNote>
        </li>
      ))}
    </ul>
  );
}
