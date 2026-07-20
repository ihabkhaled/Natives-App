import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { SquadCardProps } from './squad-card.types';

/** One season squad with its lifecycle state, revision, and deadline. */
export function SquadCard(props: SquadCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li data-testid={TEST_IDS.squadCard} className="app-surface-card app-squad-card">
      <div className="app-squad-card__main">
        <IonText>
          <h3 className="app-squad-card__title m-0">{item.name}</h3>
        </IonText>
        <IonNote>{`${item.revisionLabel} · ${item.thresholdLabel}`}</IonNote>
        <IonNote>{item.deadlineLabel}</IonNote>
      </div>
      <div className="app-squad-card__meta">
        <StatusChip label={item.statusLabel} tone={item.statusTone} />
        <AppButton
          label={item.openLabel}
          tone="ghost"
          testId={TEST_IDS.squadOpen}
          onClick={() => {
            props.onOpen(item.id);
          }}
        />
      </div>
    </li>
  );
}
