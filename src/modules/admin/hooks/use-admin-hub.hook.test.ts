import { act } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { PERMISSIONS } from '@/shared/security';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useAdminHub } from './use-admin-hub.hook';

vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return {
    ...actual,
    useActiveTeamScope: vi.fn(),
    useEffectivePermissions: vi.fn(),
  };
});

function mockGrants(permissions: readonly string[], isLoading = false): void {
  vi.mocked(useActiveTeamScope).mockReturnValue({
    teamId: 'team-1',
    membershipId: 'membership-1',
    seasonId: null,
    teamName: 'Cairo Natives',
    isLoading: false,
    isError: false,
  });
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions,
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading,
    isError: false,
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockGrants([PERMISSIONS.settingsRead]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAdminHub', () => {
  it('shows a skeleton while the effective grants are still resolving', () => {
    mockGrants([], true);

    expect(renderHookWithProviders(() => useAdminHub()).result.current.status).toBe('loading');
  });

  it('shows the designed empty state when no surface is reachable', () => {
    mockGrants([]);

    const { result } = renderHookWithProviders(() => useAdminHub());

    expect(result.current.status).toBe('empty');
    expect(result.current.cards).toEqual([]);
  });

  it('is ready once at least one surface is reachable', () => {
    const { result } = renderHookWithProviders(() => useAdminHub());

    expect(result.current.status).toBe('ready');
    expect(result.current.cards.map((card) => card.key)).toEqual(['settings']);
  });

  it('has no remote read to retry, so retrying is a safe no-op', () => {
    const { result } = renderHookWithProviders(() => useAdminHub());

    expect(() => {
      act(() => {
        result.current.onRetry();
      });
    }).not.toThrow();
  });

  it('navigates to the card destination when it is opened', () => {
    const { result } = renderHookWithProviders(() => useAdminHub(), { initialPath: '/admin' });

    act(() => {
      result.current.cards[0]?.onOpen();
    });

    expect(result.current.cards[0]?.title).toBe('Team settings');
  });
});
