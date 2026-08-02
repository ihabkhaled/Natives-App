import { vi } from 'vitest';

import { useSession } from '@/modules/auth';

import { buildSessionView } from '../factories/session-view.factory';

/**
 * Points the mocked `useSession` at a given resolution/authentication pair.
 *
 * Shared by the public navbar and footer specs: both drive the same
 * `resolvePublicShellVisibility` decision, so they need the identical session
 * double and were carrying a byte-identical copy of it.
 *
 * The caller must already have `vi.mock`ed `@/modules/auth` — this only sets
 * the return value.
 */
export function mockPublicShellSession(isResolved: boolean, isAuthenticated: boolean): void {
  vi.mocked(useSession).mockReturnValue(buildSessionView({ isResolved, isAuthenticated }));
}
