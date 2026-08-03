import { renderHook } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { PERMISSIONS } from '@/shared/security';
import { useNetworkStatus } from '@/platform';

import {
  buildJerseyGrants,
  buildJerseyTeamScope,
} from '../../../../tests/factories/jersey-view.factory';
import { useJerseyContext } from './use-jersey-context.hook';

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});

interface ArrangeOptions {
  readonly isOnline?: boolean;
  readonly isLoading?: boolean;
}

function arrange(permissions: readonly string[], options: ArrangeOptions = {}): void {
  vi.mocked(useEffectivePermissions).mockReturnValue(buildJerseyGrants(permissions));
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: options.isOnline ?? true });
  vi.mocked(useActiveTeamScope).mockReturnValue(
    buildJerseyTeamScope({ isLoading: options.isLoading ?? false }),
  );
}

describe('useJerseyContext', () => {
  it('lets a read holder see the orders but not open one', () => {
    arrange([PERMISSIONS.jerseyRead]);

    expect(renderHook(() => useJerseyContext()).result.current).toMatchObject({
      teamId: 'team-1',
      canRead: true,
      canManage: false,
      isOffline: false,
    });
  });

  it('lets a manage holder open an order and read the names in it', () => {
    arrange([PERMISSIONS.jerseyRead, PERMISSIONS.jerseyManage]);

    expect(renderHook(() => useJerseyContext()).result.current.canManage).toBe(true);
  });

  it('refuses the screen to a principal holding neither grant', () => {
    arrange([]);

    expect(renderHook(() => useJerseyContext()).result.current.canRead).toBe(false);
  });

  it('reports offline from the platform network status', () => {
    arrange([PERMISSIONS.jerseyRead], { isOnline: false });

    expect(renderHook(() => useJerseyContext()).result.current.isOffline).toBe(true);
  });

  it('stays loading while the team scope resolves', () => {
    arrange([PERMISSIONS.jerseyRead], { isLoading: true });

    expect(renderHook(() => useJerseyContext()).result.current.isLoading).toBe(true);
  });
});
