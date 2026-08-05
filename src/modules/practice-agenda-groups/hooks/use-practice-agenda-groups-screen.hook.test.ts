import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppQuery } from '@/packages/query';
import { PERMISSIONS } from '@/shared/security';

import { buildAgendaGroupsFormsStub as stubForms } from '../../../../tests/factories/practice-agenda-groups-forms.factory';
import { useAgendaGroupsActions } from './use-agenda-groups-actions.hook';
import { useAgendaGroupsForms } from './use-agenda-groups-forms.hook';
import { usePracticeAgendaGroupsScreen } from './use-practice-agenda-groups-screen.hook';

vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('./use-agenda-groups-forms.hook', () => ({ useAgendaGroupsForms: vi.fn() }));
vi.mock('./use-agenda-groups-actions.hook', () => ({ useAgendaGroupsActions: vi.fn() }));

function stubActions(): ReturnType<typeof useAgendaGroupsActions> {
  return {
    notice: null,
    isMutating: false,
    onCreateSubmit: vi.fn(),
    onCopySubmit: vi.fn(),
    onAddMember: vi.fn(),
    onRemoveMember: vi.fn(),
    onRemoveGroup: vi.fn(),
  };
}

/** A coach whose team and grants are already resolved, mid-session. */
const RESOLVED_COACH_SCOPE = { teamId: 't1', isLoading: false };
const MANAGE_GRANT = { permissions: [PERMISSIONS.practicesManage], isLoading: false };
const IDLE_EMPTY_READ = { data: undefined, isPending: false, isError: false };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAgendaGroupsForms).mockReturnValue(stubForms());
  vi.mocked(useAgendaGroupsActions).mockReturnValue(stubActions());
  vi.mocked(useActiveTeamScope).mockReturnValue(RESOLVED_COACH_SCOPE as never);
  vi.mocked(useEffectivePermissions).mockReturnValue(MANAGE_GRANT as never);
  vi.mocked(useAppQuery).mockReturnValue(IDLE_EMPTY_READ as never);
});

describe('usePracticeAgendaGroupsScreen', () => {
  it('reads the plan once the team scope and grants are known', () => {
    renderHook(() => usePracticeAgendaGroupsScreen('s1'));

    expect(useAppQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  /**
   * A member may read the published agenda in `practice-agenda`, but this
   * screen's plan carries private coach notes and the roster split — a
   * member has no more reason to see either than who has not RSVPed.
   */
  it('withholds the screen from a principal without practice.manage', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({
      ...MANAGE_GRANT,
      permissions: [],
    } as never);

    const { result } = renderHook(() => usePracticeAgendaGroupsScreen('s1'));

    expect(result.current.isForbidden).toBe(true);
  });

  it('holds off calling a principal forbidden until their grants have resolved', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({
      ...MANAGE_GRANT,
      permissions: [],
      isLoading: true,
    } as never);
    const { result } = renderHook(() => usePracticeAgendaGroupsScreen('s1'));

    expect(result.current.isForbidden).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('does not query while the team scope or permissions are still loading', () => {
    vi.mocked(useActiveTeamScope).mockReturnValue({
      ...RESOLVED_COACH_SCOPE,
      isLoading: true,
    } as never);

    renderHook(() => usePracticeAgendaGroupsScreen('s1'));

    expect(useAppQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('reports a read failure', () => {
    vi.mocked(useAppQuery).mockReturnValue({ ...IDLE_EMPTY_READ, isError: true } as never);

    const { result } = renderHook(() => usePracticeAgendaGroupsScreen('s1'));

    expect(result.current.hasError).toBe(true);
  });

  it('carries the notice and mutating flag from the actions hook', () => {
    vi.mocked(useAgendaGroupsActions).mockReturnValue({
      ...stubActions(),
      notice: 'Group created.',
      isMutating: true,
    });

    const { result } = renderHook(() => usePracticeAgendaGroupsScreen('s1'));

    expect(result.current.notice).toBe('Group created.');
    expect(result.current.createForm.isSaving).toBe(true);
  });
});
