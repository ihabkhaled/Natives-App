// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it,
// so neither the factory nor the imports it needs can move into a shared
// helper. Only the payloads could, and they now come from
// tests/setup/screen-grants.helper.ts.
import {
  buildEffectivePermissions,
  buildTeamScope,
} from '../../../../tests/setup/screen-grants.helper';
import { renderHook } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import { useGovernanceContext } from './use-governance-context.hook';

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});
// jscpd:ignore-end

function arrange(permissions: readonly string[], isOnline = true, isLoading = false): void {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline });
  vi.mocked(useActiveTeamScope).mockReturnValue(buildTeamScope({ isLoading }));
  vi.mocked(useEffectivePermissions).mockReturnValue(buildEffectivePermissions(permissions));
}

describe('useGovernanceContext', () => {
  it('grants the board record to a principal holding governance.read', () => {
    arrange([PERMISSIONS.governanceRead]);

    expect(renderHook(() => useGovernanceContext()).result.current).toMatchObject({
      teamId: 'team-1',
      canRead: true,
      isOffline: false,
    });
  });

  it('refuses it without the grant', () => {
    arrange([]);

    expect(renderHook(() => useGovernanceContext()).result.current.canRead).toBe(false);
  });

  it('reports offline from the platform network status', () => {
    arrange([PERMISSIONS.governanceRead], false);

    expect(renderHook(() => useGovernanceContext()).result.current.isOffline).toBe(true);
  });

  it('stays loading while the team scope resolves', () => {
    arrange([PERMISSIONS.governanceRead], true, true);

    expect(renderHook(() => useGovernanceContext()).result.current.isLoading).toBe(true);
  });
});
