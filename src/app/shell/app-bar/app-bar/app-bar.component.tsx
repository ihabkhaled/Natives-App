import { APP_ICONS } from '@/packages/icons';
import { IonIcon } from '@/packages/ionic';
import { AvatarFallback } from '@/shared/ui';

import { TeamSwitcher } from '../../team-switcher';
import { NotificationsPanel } from '../notifications-panel';

import { APP_BAR_TEST_IDS } from './app-bar.constants';
import type { AppBarProps } from './app-bar.types';

/**
 * The global top bar: routed page title with its product context on the lead
 * side, and the persistent account cluster — palette switch, notifications
 * affordance, and the avatar button that opens the account menu — on the trail
 * side. UI-only; open/closed state and every handler arrive prepared.
 */
export function AppBar(props: AppBarProps): React.JSX.Element | null {
  return props.isVisible ? (
    <header className="app-bar" data-testid={APP_BAR_TEST_IDS.bar}>
      <div className="app-bar__lead">
        <p className="app-bar__context">{props.context}</p>
        <h1 className="app-bar__title">{props.title}</h1>
      </div>
      <div className="app-bar__actions" aria-label={props.ariaLabel} role="group">
        <TeamSwitcher {...props.teamSwitcher} />
        <button
          type="button"
          className="app-bar__icon-button"
          data-testid={APP_BAR_TEST_IDS.themeToggle}
          aria-label={props.themeToggleLabel}
          aria-pressed={props.isDark}
          onClick={props.onToggleTheme}
        >
          <IonIcon icon={props.isDark ? APP_ICONS.sun : APP_ICONS.moon} aria-hidden="true" />
        </button>
        <div className="app-bar__slot">
          <button
            type="button"
            className="app-bar__icon-button"
            data-testid={APP_BAR_TEST_IDS.notifications}
            aria-label={props.notificationsLabel}
            aria-expanded={props.isNotificationsOpen}
            onClick={props.onToggleNotifications}
          >
            <IonIcon icon={APP_ICONS.notifications} aria-hidden="true" />
            {props.notificationsBadgeLabel === null ? null : (
              <span
                className="app-bar__badge"
                data-testid={APP_BAR_TEST_IDS.notificationsBadge}
                aria-hidden="true"
              >
                {props.notificationsUnreadCount}
              </span>
            )}
          </button>
          {props.isNotificationsOpen ? (
            <NotificationsPanel
              panelTitle={props.notificationsPanelTitle}
              emptyTitle={props.notificationsEmptyTitle}
              emptyMessage={props.notificationsEmptyMessage}
              loadingLabel={props.notificationsLoadingLabel}
              isLoading={props.isNotificationsLoading}
              items={props.notificationsLatest}
              unreadChipLabel={props.notificationsLabel}
              viewAllLabel={props.notificationsViewAllLabel}
              preferencesLabel={props.notificationsPreferencesLabel}
              onOpen={props.onOpenNotification}
              onViewAll={props.onViewAllNotifications}
              onOpenPreferences={props.onOpenNotificationPreferences}
            />
          ) : null}
        </div>
        <div className="app-bar__slot">
          <button
            type="button"
            className="app-bar__avatar-button"
            data-testid={APP_BAR_TEST_IDS.userMenuButton}
            aria-label={props.userMenuLabel}
            aria-expanded={props.isUserMenuOpen}
            aria-haspopup="menu"
            onClick={props.onToggleUserMenu}
          >
            <AvatarFallback name={props.userName} label={props.avatarLabel} size="sm" />
            <IonIcon
              icon={APP_ICONS.chevronDown}
              aria-hidden="true"
              className="app-bar__avatar-caret"
            />
          </button>
          {props.isUserMenuOpen ? (
            <div
              className="app-bar__popover app-bar__popover--menu"
              role="menu"
              data-testid={APP_BAR_TEST_IDS.userMenu}
            >
              {props.userMenuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  className="app-bar__menu-item"
                  data-testid={item.testId}
                  onClick={item.onSelect}
                >
                  <IonIcon icon={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  ) : null;
}
