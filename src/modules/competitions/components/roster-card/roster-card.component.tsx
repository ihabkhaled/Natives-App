import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { RosterCardProps } from './roster-card.types';

/** One roster with its kind, division, size policy, and revision. */
export function RosterCard(props: RosterCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li data-testid={TEST_IDS.rosterCard} className="app-surface-card app-tryout-card">
      <div className="app-tryout-card__main">
        <IonText>
          <h3 className="app-tryout-card__title m-0">{item.name}</h3>
        </IonText>
        <IonNote>{`${item.kindLabel} · ${item.divisionLabel}`}</IonNote>
        <IonNote>{`${item.sizeLabel} · ${item.revisionLabel}`}</IonNote>
      </div>
      <div className="app-tryout-card__meta">
        <StatusChip label={item.statusLabel} tone={item.statusTone} />
        <AppButton
          label={item.openLabel}
          tone="ghost"
          testId={TEST_IDS.rosterOpen}
          onClick={() => {
            props.onOpen(item.id);
          }}
        />
      </div>
    </li>
  );
}
