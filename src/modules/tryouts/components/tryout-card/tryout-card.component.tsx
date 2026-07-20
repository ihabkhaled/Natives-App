import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { TryoutCardProps } from './tryout-card.types';

/** One tryout event with its capacity and waitlist counts. */
export function TryoutCard(props: TryoutCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li data-testid={TEST_IDS.tryoutCard} className="app-surface-card app-tryout-card">
      <div className="app-tryout-card__main">
        <IonText>
          <h3 className="app-tryout-card__title m-0">{item.name}</h3>
        </IonText>
        <IonNote>{item.heldAtLabel}</IonNote>
        <IonNote>{`${item.capacityLabel} · ${item.waitlistLabel}`}</IonNote>
      </div>
      <div className="app-tryout-card__meta">
        <StatusChip label={item.statusLabel} tone={item.statusTone} />
        <AppButton
          label={item.openLabel}
          tone="ghost"
          testId={TEST_IDS.tryoutOpen}
          onClick={() => {
            props.onOpen(item.id);
          }}
        />
      </div>
    </li>
  );
}
