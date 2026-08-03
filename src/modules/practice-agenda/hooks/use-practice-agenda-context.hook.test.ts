// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { PERMISSIONS } from '@/shared/security';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import {
  buildAgendaGrants,
  buildAgendaTeamScope,
} from '../../../../tests/factories/practice-agenda-view.factory';
import { usePracticeAgendaContext } from './use-practice-agenda-context.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/platform', () => createPlatformMock());

function mockGrants(permissions: readonly string[], isLoading = false): void {
  vi.mocked(useActiveTeamScope).mockReturnValue(buildAgendaTeamScope(isLoading));
  vi.mocked(useEffectivePermissions).mockReturnValue(buildAgendaGrants(permissions));
}

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeAgendaContext', () => {
  it('separates reading the plan from being allowed to change it', () => {
    mockGrants([PERMISSIONS.practicesRead]);
    const { result } = renderHook(() => usePracticeAgendaContext());

    // A member attending the session may read the agenda; only a coach plans it.
    expect(result.current.canRead).toBe(true);
    expect(result.current.canManage).toBe(false);
  });

  it('grants planning to the manage holder', () => {
    mockGrants([PERMISSIONS.practicesRead, PERMISSIONS.practicesManage]);
    const { result } = renderHook(() => usePracticeAgendaContext());

    expect(result.current.canManage).toBe(true);
    expect(result.current.teamId).toBe('team-1');
  });

  it('stays loading while the grants are still resolving', () => {
    mockGrants([], true);
    const { result } = renderHook(() => usePracticeAgendaContext());

    expect(result.current.isLoading).toBe(true);
  });

  it('reports the connection so a failed read can blame the right thing', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mockGrants([PERMISSIONS.practicesRead]);
    const { result } = renderHook(() => usePracticeAgendaContext());

    expect(result.current.isOffline).toBe(true);
  });
});
