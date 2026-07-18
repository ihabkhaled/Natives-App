import { describe, expect, it } from 'vitest';

import { AUTH_ANALYTICS_EVENTS } from './auth-analytics.constants';

describe('AUTH_ANALYTICS_EVENTS', () => {
  it('pins the auth event names', () => {
    expect(AUTH_ANALYTICS_EVENTS).toEqual({
      loginSucceeded: 'auth.login_succeeded',
      logoutCompleted: 'auth.logout_completed',
      passwordResetRequested: 'auth.password_reset_requested',
      passwordResetCompleted: 'auth.password_reset_completed',
      invitationAccepted: 'auth.invitation_accepted',
      sessionRevoked: 'auth.session_revoked',
    });
  });

  it('namespaces every event under the owning module', () => {
    for (const event of Object.values(AUTH_ANALYTICS_EVENTS)) {
      expect(event.startsWith('auth.')).toBe(true);
    }
  });
});
