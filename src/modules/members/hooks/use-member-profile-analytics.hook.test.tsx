import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type * as RouterPackage from '@/packages/router';

import { useMemberProfile } from './use-member-profile.hook';
import type { MembersTeamContextView } from './use-members-team-context.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const pushSpy = vi.fn();

vi.mock('@/shared/ui', () => ({
  useAppToast: () => ({ showToast: vi.fn() }),
  useConfirmAlert: () => ({ confirm: vi.fn() }),
}));

vi.mock('@/packages/router', async (importOriginal) => {
  const actual = await importOriginal<typeof RouterPackage>();
  return {
    ...actual,
    useRouteParam: () => 'mem-omar',
    useAppNavigation: () => ({ push: pushSpy, replace: vi.fn(), goBack: vi.fn() }),
  };
});

const teamContext: MembersTeamContextView = {
  teamId: 'team-natives',
  teamName: 'Natives',
  isLoading: false,
  isError: false,
  permissions: [],
  canInvite: false,
  canManageLifecycle: false,
  canManageRoles: false,
  canManageAliases: false,
  canEditSelf: false,
  canReadTeamAnalytics: true,
};

vi.mock('./use-members-team-context.hook', () => ({
  useMembersTeamContext: () => teamContext,
}));

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberProfile analytics deep-link', () => {
  it('exposes the analytics link for a grant holder and pushes the player route', async () => {
    const { result } = renderHookWithProviders(() => useMemberProfile());
    await waitFor(() => {
      expect(result.current.analyticsLink).not.toBeNull();
    });
    act(() => result.current.analyticsLink?.onOpen());
    expect(pushSpy).toHaveBeenCalledWith(expect.stringContaining('mem-omar'));
  });
});
