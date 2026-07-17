import { describe, expect, it } from 'vitest';

import { AUTH_ANALYTICS_EVENTS } from './auth-analytics.constants';

describe('AUTH_ANALYTICS_EVENTS', () => {
  it('pins the auth event names', () => {
    expect(AUTH_ANALYTICS_EVENTS).toEqual({
      loginSucceeded: 'auth.login_succeeded',
      logoutCompleted: 'auth.logout_completed',
    });
  });

  it('namespaces every event under the owning module', () => {
    for (const event of Object.values(AUTH_ANALYTICS_EVENTS)) {
      expect(event.startsWith('auth.')).toBe(true);
    }
  });
});
