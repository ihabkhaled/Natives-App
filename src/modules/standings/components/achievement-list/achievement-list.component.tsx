import { APP_ICONS } from '@/packages/icons';
import { IonIcon, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { AchievementListProps } from './achievement-list.types';

/**
 * The workspace list: one card per claim with its category icon, subject,
 * status, visibility, and source tag. Opening a card reveals the detail panel
 * with the approval timeline.
 */
export function AchievementList(props: AchievementListProps): React.JSX.Element {
  return (
    <ul className="app-achievement-list" data-testid={TEST_IDS.achievementsList}>
      {props.cards.map((card) => (
        <li key={card.key}>
          <button
            type="button"
            className="app-achievement-card"
            data-testid={TEST_IDS.achievementCard}
            onClick={card.onOpen}
          >
            <IonIcon
              icon={APP_ICONS[card.iconName]}
              aria-hidden="true"
              className="app-achievement-card__icon"
            />
            <span className="app-achievement-card__body">
              <span className="app-achievement-card__title">{card.title}</span>
              <IonNote>{card.achievedOn}</IonNote>
              <IonNote>{card.subject}</IonNote>
              <IonNote>{card.sourceTag}</IonNote>
            </span>
            <span className="app-achievement-card__chips">
              <StatusChip label={card.statusChip.label} tone={card.statusChip.tone} />
              <StatusChip label={card.visibilityChip.label} tone={card.visibilityChip.tone} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
