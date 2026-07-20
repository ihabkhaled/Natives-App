import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { CompetitionStageListProps } from './competition-stage-list.types';

/** Stages in playing order, each listing the rounds it contains. */
export function CompetitionStageList(props: CompetitionStageListProps): React.JSX.Element {
  return props.items.length === 0 ? (
    <IonNote>{props.emptyLabel}</IonNote>
  ) : (
    <ol data-testid={TEST_IDS.competitionStages} className="app-stage-list">
      {props.items.map((stage) => (
        <li key={stage.id} data-testid={TEST_IDS.competitionStage} className="app-stage-list__item">
          <div className="app-stage-list__head">
            <span className="app-stage-list__ordinal" aria-hidden="true">
              {stage.ordinalLabel}
            </span>
            <IonText>
              <h3 className="app-stage-list__title m-0">{stage.name}</h3>
            </IonText>
            <IonNote>{stage.formatLabel}</IonNote>
          </div>
          {stage.rounds.length === 0 ? (
            <IonNote>{stage.roundsEmptyLabel}</IonNote>
          ) : (
            <ul className="app-stage-list__rounds" aria-label={stage.roundsLabel}>
              {stage.rounds.map((round) => (
                <li key={round} data-testid={TEST_IDS.competitionRound}>
                  {round}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
