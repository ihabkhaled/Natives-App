import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { PERMISSIONS } from '@/shared/security';

import { usePracticeSchedulesListScreen } from './use-practice-schedules-list-screen.hook';

vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));
vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));

const push = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [PERMISSIONS.practicesManage],
    isLoading: false,
  } as never);
  vi.mocked(useAppQuery).mockReturnValue({
    data: { items: [], total: 0, limit: 20, offset: 0 },
    isPending: false,
    isError: false,
  } as never);
  vi.mocked(useAppNavigation).mockReturnValue({
    push,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: '/practice-schedules',
  });
});

describe('usePracticeSchedulesListScreen', () => {
  it('withholds the screen from a principal without practice.manage', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: false,
    } as never);

    const { result } = renderHook(() => usePracticeSchedulesListScreen());

    expect(result.current.isForbidden).toBe(true);
  });

  it('does not call a principal forbidden while permissions are still resolving', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: true,
    } as never);

    const { result } = renderHook(() => usePracticeSchedulesListScreen());

    expect(result.current.isForbidden).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('navigates to the create route when "new" is pressed', () => {
    const { result } = renderHook(() => usePracticeSchedulesListScreen());

    result.current.onNew();

    expect(push).toHaveBeenCalledWith('/practice-schedules/new');
  });

  it('navigates to a schedule detail route when a row is opened', () => {
    const { result } = renderHook(() => usePracticeSchedulesListScreen());

    result.current.onOpen('s1');

    expect(push).toHaveBeenCalledWith('/practice-schedules/s1');
  });

  it('surfaces a failed read', () => {
    vi.mocked(useAppQuery).mockReturnValue({ data: undefined, isPending: false, isError: true } as never);

    const { result } = renderHook(() => usePracticeSchedulesListScreen());

    expect(result.current.hasError).toBe(true);
  });
});
