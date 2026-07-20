import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { CompetitionCardProps } from './competition-card.types';

/** One competition: identity and window on the lead side, state on the trail. */
export function CompetitionCard(props: CompetitionCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li data-testid={TEST_IDS.competitionCard} className="app-surface-card app-competition-card">
      <div className="app-competition-card__main">
        <IonText>
          <h3 className="app-competition-card__title m-0">{item.name}</h3>
        </IonText>
        <IonNote>{`${item.typeLabel} · ${item.windowLabel}`}</IonNote>
        <IonNote>{`${item.organizerLabel} · ${item.divisionLabel}`}</IonNote>
      </div>
      <div className="app-competition-card__meta">
        <StatusChip label={item.statusLabel} tone={item.statusTone} />
        <AppButton
          label={item.openLabel}
          tone="ghost"
          testId={TEST_IDS.competitionOpen}
          onClick={() => {
            props.onOpen(item.id);
          }}
        />
      </div>
    </li>
  );
}
