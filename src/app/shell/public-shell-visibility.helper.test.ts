import { describe, expect, it } from 'vitest';

import { SESSION_STATUS } from '@/modules/auth';

import { resolvePublicShellVisibility } from './public-shell-visibility.helper';

describe('resolvePublicShellVisibility', () => {
  it('hides the public shell while the session status is still unknown', () => {
    expect(
      resolvePublicShellVisibility({
        status: SESSION_STATUS.Unknown,
        isAuthenticated: false,
        isResolved: false,
      }),
    ).toBe(false);
  });

  it('shows the public shell for a resolved, anonymous session', () => {
    expect(
      resolvePublicShellVisibility({
        status: SESSION_STATUS.Anonymous,
        isAuthenticated: false,
        isResolved: true,
      }),
    ).toBe(true);
  });

  it('hides the public shell once a session is authenticated', () => {
    expect(
      resolvePublicShellVisibility({
        status: SESSION_STATUS.Authenticated,
        isAuthenticated: true,
        isResolved: true,
      }),
    ).toBe(false);
  });
});
