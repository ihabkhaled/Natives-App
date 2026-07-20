import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { CompetitionFixtureListProps } from './competition-fixture-list.types';

/** Fixtures in Cairo time, with reschedule provenance kept visible. */
export function CompetitionFixtureList(props: CompetitionFixtureListProps): React.JSX.Element {
  return props.items.length === 0 ? (
    <IonNote>{props.emptyLabel}</IonNote>
  ) : (
    <ul data-testid={TEST_IDS.competitionFixtures} className="app-fixture-list">
      {props.items.map((fixture) => (
        <li
          key={fixture.id}
          data-testid={TEST_IDS.competitionFixture}
          className="app-fixture-list__item"
        >
          <div className="app-fixture-list__main">
            <IonText>
              <h3 className="app-fixture-list__title m-0">{fixture.opponentName}</h3>
            </IonText>
            <IonNote>{`${fixture.homeAwayLabel} · ${fixture.timeLabel}`}</IonNote>
            <IonNote>{fixture.venueLabel}</IonNote>
            {fixture.rescheduleNote === null ? null : (
              <p className="app-fixture-list__note m-0">{fixture.rescheduleNote}</p>
            )}
          </div>
          <StatusChip label={fixture.statusLabel} tone={fixture.statusTone} />
        </li>
      ))}
    </ul>
  );
}
