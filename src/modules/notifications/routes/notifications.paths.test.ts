import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  notificationLinkPath,
  notificationLinkPattern,
  notificationPreferencesPagePath,
  notificationsPagePath,
} from './notifications.paths';

describe('notification path builders', () => {
  it('derives every screen path from the canonical table', () => {
    expect(notificationsPagePath()).toBe(APP_PATHS.notifications);
    expect(notificationPreferencesPagePath()).toBe(APP_PATHS.notificationPreferences);
    expect(notificationLinkPattern()).toBe(APP_PATHS.notificationLink);
  });

  it('builds the arrival path for a notification', () => {
    expect(notificationLinkPath('ntf-1')).toBe('/notifications/open/ntf-1');
  });

  it('encodes an identifier that would otherwise change the path shape', () => {
    expect(notificationLinkPath('a/b?c')).toBe('/notifications/open/a%2Fb%3Fc');
  });
});
