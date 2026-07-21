import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { NotificationRowProps } from './notification-row.types';

/**
 * One inbox entry. It carries a designed title, a category chip, and its own
 * in-app delivery state — never any content from the screen it points at.
 */
export function NotificationRow(props: NotificationRowProps): React.JSX.Element {
  const { row } = props;
  return (
    <li
      data-testid={TEST_IDS.notificationItem}
      className={`app-surface-card app-notification-row${row.isUnread ? ' app-notification-row--unread' : ''}`}
    >
      <div className="app-notification-row__main">
        <div className="app-notification-row__chips">
          <StatusChip label={row.categoryLabel} tone={row.categoryTone} />
          <StatusChip
            label={row.deliveryLabel}
            tone={row.deliveryTone}
            testId={TEST_IDS.notificationDelivery}
          />
        </div>
        <IonText>
          <h3 className="app-notification-row__title m-0">{row.title}</h3>
        </IonText>
        <IonNote>{row.body}</IonNote>
        <IonNote>{row.receivedLabel}</IonNote>
        {row.readLabel === null ? null : <IonNote>{row.readLabel}</IonNote>}
      </div>
      <div className="app-notification-row__actions">
        {row.canOpen ? (
          <AppButton
            label={row.openLabel}
            tone="ghost"
            testId={TEST_IDS.notificationOpen}
            onClick={() => {
              props.onOpen(row.id);
            }}
          />
        ) : null}
        {row.isUnread ? (
          <AppButton
            label={row.markReadLabel}
            tone="ghost"
            testId={TEST_IDS.notificationMarkRead}
            onClick={() => {
              props.onMarkRead(row.id);
            }}
          />
        ) : null}
      </div>
    </li>
  );
}
