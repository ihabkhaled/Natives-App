import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { NotificationsPanelProps } from './notifications-panel.types';

/**
 * The app bar's notification popover: the newest entries and the two ways
 * into the real inbox. Opening one routes through the link screen, which
 * re-checks authorization — the popover never navigates at a target itself.
 */
export function NotificationsPanel(props: NotificationsPanelProps): React.JSX.Element {
  return (
    <div className="app-bar__popover" data-testid={TEST_IDS.appBarNotificationsPanel}>
      <p className="app-bar__popover-title">{props.panelTitle}</p>

      {props.isLoading ? <IonNote>{props.loadingLabel}</IonNote> : null}

      {!props.isLoading && props.items.length === 0 ? (
        <>
          <p className="app-bar__popover-title">{props.emptyTitle}</p>
          <p className="app-bar__popover-note">{props.emptyMessage}</p>
        </>
      ) : null}

      <ul className="app-bar__notification-list">
        {props.items.map((item) => (
          <li key={item.id} className="app-bar__notification">
            <button
              type="button"
              className="app-bar__notification-button"
              data-testid={TEST_IDS.appBarNotificationItem}
              onClick={() => {
                props.onOpen(item.id);
              }}
            >
              <IonText>
                <span className="app-bar__notification-title">{item.title}</span>
              </IonText>
              <IonNote>{item.receivedLabel}</IonNote>
            </button>
            {item.isUnread ? <StatusChip label={props.unreadChipLabel} tone="primary" /> : null}
          </li>
        ))}
      </ul>

      <div className="app-bar__popover-actions">
        <AppButton
          label={props.viewAllLabel}
          tone="ghost"
          testId={TEST_IDS.appBarNotificationsViewAll}
          onClick={props.onViewAll}
        />
        <AppButton
          label={props.preferencesLabel}
          tone="ghost"
          testId={TEST_IDS.appBarNotificationsPreferences}
          onClick={props.onOpenPreferences}
        />
      </div>
    </div>
  );
}
