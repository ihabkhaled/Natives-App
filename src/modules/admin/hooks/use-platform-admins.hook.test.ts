import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as QueryPackage from '@/packages/query';
import { useAppQuery, useInvalidatingMutation } from '@/packages/query';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import type * as SharedUiModule from '@/shared/ui';
import { useConfirmAlert } from '@/shared/ui';

import { setupToastHarness } from '../../../../tests/setup/toast-test.helper';
import { promoteSuperAdmin } from '../services/promote-super-admin.service';
import { revokeSuperAdmin } from '../services/revoke-super-admin.service';
import type { SuperAdminRoster } from '../types/admin.types';
import { usePlatformAdmins } from './use-platform-admins.hook';
import { useAdminContext } from './use-admin-context.hook';

vi.mock('@/packages/query', async (importOriginal) => {
  const queryPackage = await importOriginal<typeof QueryPackage>();
  return { ...queryPackage, useAppQuery: vi.fn(), useInvalidatingMutation: vi.fn() };
});
vi.mock('@/shared/ui', async (importOriginal) => {
  const sharedUi = await importOriginal<typeof SharedUiModule>();
  return { ...sharedUi, useAppToast: vi.fn(), useConfirmAlert: vi.fn() };
});
vi.mock('./use-admin-context.hook', () => ({ useAdminContext: vi.fn() }));
vi.mock('../services/promote-super-admin.service', () => ({ promoteSuperAdmin: vi.fn() }));
vi.mock('../services/revoke-super-admin.service', () => ({ revokeSuperAdmin: vi.fn() }));

type MutationOptions = Parameters<typeof useInvalidatingMutation>[0];

const toast = setupToastHarness();
const confirm = vi.fn();

const ROSTER: SuperAdminRoster = {
  items: [
    {
      assignmentId: 'assignment-1',
      userId: 'user-1',
      email: 'root@example.com',
      displayName: 'Ranger One',
      effectiveFromIso: '2026-01-05T09:00:00.000Z',
      grantedBy: null,
    },
  ],
  total: 1,
};

function mockPlatform(overrides: { canManagePlatform?: boolean; data?: SuperAdminRoster } = {}): {
  promoteRun: ReturnType<typeof vi.fn>;
  revokeRun: ReturnType<typeof vi.fn>;
} {
  vi.mocked(useAdminContext).mockReturnValue({
    teamId: 'team-1',
    membershipId: 'membership-1',
    isOffline: false,
    canReadSettings: true,
    canManageSettings: true,
    canManageRoles: true,
    canManageRules: true,
    canReadAudit: true,
    canManageOutbox: true,
    canManagePlatform: overrides.canManagePlatform ?? true,
    isLoading: false,
  });
  vi.mocked(useAppQuery).mockReturnValue({
    data: overrides.data ?? ROSTER,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  const promoteRun = vi.fn();
  const revokeRun = vi.fn();
  // Order in the hook: promote first, revoke second — stable across renders.
  let call = 0;
  vi.mocked(useInvalidatingMutation).mockImplementation(() =>
    call++ % 2 === 0 ? { run: promoteRun, isRunning: false } : { run: revokeRun, isRunning: false },
  );
  return { promoteRun, revokeRun };
}

function mutationOptionsAt(index: number): MutationOptions {
  const options = vi.mocked(useInvalidatingMutation).mock.calls[index]?.[0];
  if (options === undefined) {
    throw new Error('expected the mutation to be composed');
  }
  return options;
}

beforeEach(() => {
  confirm.mockResolvedValue(true);
  vi.mocked(useConfirmAlert).mockReturnValue({ confirm });
});

describe('usePlatformAdmins', () => {
  it('gates the roster read on the global platform grant', () => {
    mockPlatform({ canManagePlatform: false });

    const { result } = renderHook(() => usePlatformAdmins());

    expect(vi.mocked(useAppQuery).mock.calls[0]?.[0]).toMatchObject({ enabled: false });
    expect(result.current.status).toBe('forbidden');
  });

  it('lists the roster rows with identity and grant facts', () => {
    mockPlatform();

    const { result } = renderHook(() => usePlatformAdmins());

    expect(result.current.status).toBe('ready');
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]?.name).toBe('Ranger One');
    expect(result.current.rows[0]?.email).toBe('root@example.com');
  });

  it('blocks promotion until a user id and an 8+ character reason exist', () => {
    mockPlatform();

    const { result } = renderHook(() => usePlatformAdmins());
    expect(result.current.canPromote).toBe(false);

    act(() => {
      result.current.onUserIdChange('user-2');
    });
    act(() => {
      result.current.onReasonChange('short');
    });
    expect(result.current.canPromote).toBe(false);
    expect(result.current.validationMessage).not.toBeNull();

    act(() => {
      result.current.onReasonChange('Succession planning for platform operations');
    });
    expect(result.current.canPromote).toBe(true);
    expect(result.current.validationMessage).toBeNull();
  });

  it('promotes only after the explicit confirm, with the trimmed inputs', async () => {
    const { promoteRun } = mockPlatform();

    const { result } = renderHook(() => usePlatformAdmins());
    act(() => {
      result.current.onUserIdChange('  user-2  ');
    });
    act(() => {
      result.current.onReasonChange('  Succession planning  ');
    });
    act(() => {
      result.current.onPromote();
    });

    await waitFor(() => {
      expect(promoteRun).toHaveBeenCalledExactlyOnceWith({
        userId: 'user-2',
        reason: 'Succession planning',
      });
    });
    expect(confirm).toHaveBeenCalledOnce();
  });

  it('does nothing when the confirm dialog is dismissed', async () => {
    confirm.mockResolvedValue(false);
    const { promoteRun } = mockPlatform();

    const { result } = renderHook(() => usePlatformAdmins());
    act(() => {
      result.current.onUserIdChange('user-2');
    });
    act(() => {
      result.current.onReasonChange('Succession planning');
    });
    act(() => {
      result.current.onPromote();
    });

    await waitFor(() => {
      expect(confirm).toHaveBeenCalledOnce();
    });
    expect(promoteRun).not.toHaveBeenCalled();
  });

  it('refuses to promote without valid inputs even if forced', () => {
    mockPlatform();

    const { result } = renderHook(() => usePlatformAdmins());
    act(() => {
      result.current.onPromote();
    });

    expect(confirm).not.toHaveBeenCalled();
  });

  it('revokes a row only after its own confirm names the target', async () => {
    const { revokeRun } = mockPlatform();

    const { result } = renderHook(() => usePlatformAdmins());
    act(() => {
      result.current.rows[0]?.onRevoke();
    });

    await waitFor(() => {
      expect(revokeRun).toHaveBeenCalledExactlyOnceWith('user-1');
    });
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('root@example.com') as string }),
    );
  });

  it('clears the draft and confirms with a toast after a promotion lands', () => {
    mockPlatform();
    renderHook(() => usePlatformAdmins());

    mutationOptionsAt(0).onSuccess();

    expect(toast.showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
  });

  it('states the LAST-admin refusal in privilege terms, never a generic conflict', () => {
    mockPlatform();
    renderHook(() => usePlatformAdmins());

    mutationOptionsAt(1).onError(
      new AppError({ code: APP_ERROR_CODE.Conflict, messageKey: 'errors.rbac.lastSuperAdmin' }),
    );

    expect(toast.showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'danger',
        message: expect.stringContaining('last super administrator') as string,
      }),
    );
  });

  it('wires the mutations to the real use cases', async () => {
    mockPlatform();
    vi.mocked(promoteSuperAdmin).mockResolvedValue(ROSTER.items[0]!);
    vi.mocked(revokeSuperAdmin).mockResolvedValue(true);
    renderHook(() => usePlatformAdmins());

    await mutationOptionsAt(0).mutationFn({ userId: 'user-2', reason: 'Succession planning' });
    await mutationOptionsAt(1).mutationFn('user-2');

    expect(promoteSuperAdmin).toHaveBeenCalledExactlyOnceWith('user-2', 'Succession planning');
    expect(revokeSuperAdmin).toHaveBeenCalledExactlyOnceWith('user-2');
  });
});
