import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, ListScreen } from '@/shared/ui';

import { NotificationRow } from '../notification-row';
import { INBOX_STATE_TEST_IDS } from './notifications-inbox-view.constants';
import type { NotificationsInboxViewProps } from './notifications-inbox-view.types';

/**
 * The inbox: filters, one designed async state, day-grouped rows, and the
 * bounded-window controls. Delivery beyond the in-app channel is described
 * honestly rather than guessed at.
 */
export function NotificationsInboxView(props: NotificationsInboxViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.notificationsPage}
      viewTestId={TEST_IDS.notificationsView}
      className="app-notifications"
      filters={[
        {
          label: props.statusFilterLabel,
          value: props.statusFilter,
          options: props.statusOptions,
          onChange: props.onStatusFilterChange,
          testId: TEST_IDS.notificationsStatusFilter,
        },
        {
          label: props.categoryFilterLabel,
          value: props.categoryFilter,
          options: props.categoryOptions,
          onChange: props.onCategoryFilterChange,
          testId: TEST_IDS.notificationsCategoryFilter,
        },
      ]}
      filterExtra={
        <div className="app-notifications__toolbar-actions">
          <IonNote>{props.unreadLabel}</IonNote>
          <AppButton
            label={props.markAllReadLabel}
            tone="secondary"
            disabled={!props.canMarkAll}
            testId={TEST_IDS.notificationsMarkAllRead}
            onClick={props.onMarkAllRead}
          />
          <AppButton
            label={props.preferencesLinkLabel}
            tone="ghost"
            testId={TEST_IDS.notificationsPreferencesLink}
            onClick={props.onOpenPreferences}
          />
        </div>
      }
      state={{ view: props, variant: 'list', ...INBOX_STATE_TEST_IDS }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <div
        data-testid={TEST_IDS.notificationsDeliveryNotice}
        className="app-notifications__delivery-notice"
      >
        <p className="app-pending-notice m-0" role="note">
          {props.deliveryNotice}
        </p>
        {props.deliveryLinkLabel === null ? null : (
          <AppButton
            label={props.deliveryLinkLabel}
            tone="ghost"
            onClick={props.onOpenDeliveryCentre}
          />
        )}
      </div>

      {props.groups.map((group) => (
        <section
          key={group.key}
          data-testid={TEST_IDS.notificationsGroup}
          aria-label={group.heading}
          className="app-notifications__group"
        >
          <IonText>
            <h2 className="app-notifications__group-title m-0">{group.heading}</h2>
          </IonText>
          <ul className="app-notifications__list">
            {group.rows.map((row) => (
              <NotificationRow
                key={row.id}
                row={row}
                onOpen={props.onOpen}
                onMarkRead={props.onMarkRead}
              />
            ))}
          </ul>
        </section>
      ))}

      <p
        data-testid={TEST_IDS.notificationsBoundedNotice}
        className="app-pending-notice m-0"
        role="note"
      >
        {props.boundedNotice}
      </p>

      {props.canLoadMore ? (
        <AppButton
          label={props.loadMoreLabel}
          tone="secondary"
          testId={TEST_IDS.notificationsLoadMore}
          onClick={props.onLoadMore}
        />
      ) : null}
    </ListScreen>
  );
}
