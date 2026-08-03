import { renderHook } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { describe, expect, it, vi } from 'vitest';
import type * as AuthModule from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';
import {
  mockTryoutCandidateReviewer,
  type ReviewerGrantOptions,
} from '../../../../tests/factories/tryout-candidates-view.factory';
import { useTryoutCandidatesContext } from './use-tryout-candidates-context.hook';

/** Only the two scope hooks are doubled; the rest of auth stays real. */
async function doubledAuthModule(
  loadReal: () => Promise<typeof AuthModule>,
): Promise<typeof AuthModule> {
  return { ...(await loadReal()), useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
}

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', (importOriginal) => doubledAuthModule(importOriginal<typeof AuthModule>));

function arrange(
  options: ReviewerGrantOptions = {},
): ReturnType<typeof useTryoutCandidatesContext> {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: options.isOnline ?? true });
  mockTryoutCandidateReviewer(options);
  return renderHook(() => useTryoutCandidatesContext()).result.current;
}

describe('useTryoutCandidatesContext', () => {
  it('opens the screen for a principal holding tryout.manage', () => {
    expect(arrange()).toMatchObject({ teamId: 'team-1', canManage: true, isOffline: false });
  });

  it('grants the screen without granting the personal data on it', () => {
    // Managing tryouts is not the same as reading a stranger's phone number.
    expect(arrange()).toMatchObject({
      canManage: true,
      canReadContacts: false,
      canReadReadiness: false,
    });
  });

  it('reads the two disclosure grants independently', () => {
    expect(
      arrange({ permissions: [PERMISSIONS.tryoutManage, PERMISSIONS.tryoutContactsRead] }),
    ).toMatchObject({ canReadContacts: true, canReadReadiness: false });
  });

  it('refuses the screen without the management grant', () => {
    expect(arrange({ permissions: [PERMISSIONS.tryoutContactsRead] }).canManage).toBe(false);
  });

  it('reports offline from the platform network status', () => {
    expect(arrange({ isOnline: false }).isOffline).toBe(true);
  });

  it('stays loading while the team scope resolves', () => {
    expect(arrange({ isLoading: true }).isLoading).toBe(true);
  });
});
