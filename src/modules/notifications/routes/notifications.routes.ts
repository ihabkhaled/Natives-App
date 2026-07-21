import { I18N_KEYS } from '@/shared/i18n';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { NotificationLinkContainer } from '../containers/notification-link.container';
import { NotificationPreferencesContainer } from '../containers/notification-preferences.container';
import { NotificationsInboxContainer } from '../containers/notifications-inbox.container';
import {
  notificationLinkPattern,
  notificationPreferencesPagePath,
  notificationsPagePath,
} from './notifications.paths';

function inboxRoute(): AppRouteDefinition {
  return {
    path: notificationsPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: NotificationsInboxContainer,
    meta: {
      key: 'notifications',
      titleKey: I18N_KEYS.notifications.title,
      permissions: [],
      requiresTeamContext: false,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 15,
        group: NAV_GROUP.Overview,
        iconName: 'notifications',
        labelKey: I18N_KEYS.notifications.navLabel,
      },
    },
  };
}

function preferencesRoute(): AppRouteDefinition {
  return {
    path: notificationPreferencesPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: NotificationPreferencesContainer,
    meta: {
      key: 'notification-preferences',
      titleKey: I18N_KEYS.notifications.preferencesTitle,
      permissions: [],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function linkRoute(): AppRouteDefinition {
  return {
    path: notificationLinkPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: NotificationLinkContainer,
    meta: {
      key: 'notification-link',
      titleKey: I18N_KEYS.notifications.linkTitle,
      permissions: [],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * Notification routes. The inbox is the caller's own, so it carries no
 * permission of its own; the link route deliberately does the same and
 * re-checks the *target's* grants on arrival instead, which is the only
 * check that stays correct after a revocation.
 */
export function getNotificationsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [preferencesRoute(), inboxRoute(), linkRoute()];
}
