import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppQuery } from '@/packages/query';
import { PERMISSIONS } from '@/shared/security';

import { useDispatchRemindersMutation } from '../mutations/use-dispatch-reminders-mutation.hook';
import { useTestReminderMutation } from '../mutations/use-test-reminder-mutation.hook';
import type {
  ReminderDispatchCallbacks,
  ReminderTestCallbacks,
} from '../mutations/practice-reminders-mutations.types';
import { usePracticeRemindersScreen } from './use-practice-reminders-screen.hook';

vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../mutations/use-dispatch-reminders-mutation.hook', () => ({
  useDispatchRemindersMutation: vi.fn(),
}));
vi.mock('../mutations/use-test-reminder-mutation.hook', () => ({
  useTestReminderMutation: vi.fn(),
}));

let dispatchCallbacks: ReminderDispatchCallbacks;
let testCallbacks: ReminderTestCallbacks;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [PERMISSIONS.practicesManage],
    isLoading: false,
  } as never);
  vi.mocked(useAppQuery).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
  } as never);
  vi.mocked(useDispatchRemindersMutation).mockImplementation((_scope, callbacks) => {
    dispatchCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useTestReminderMutation).mockImplementation((_scope, callbacks) => {
    testCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
});

describe('usePracticeRemindersScreen', () => {
  /**
   * The dispatch result is the report: a coach needs both numbers, not merely
   * that the request succeeded.
   */
  it('turns a dispatch result into the sent and held-back messages', () => {
    const { result, rerender } = renderHook(() => usePracticeRemindersScreen('s1'));

    dispatchCallbacks.onSuccess({ candidates: 4, enqueued: 1 });
    rerender();

    expect(result.current.messages.map((message) => message.text)).toEqual([
      'practiceReminders.dispatchResult',
      'practiceReminders.dispatchHeldBack',
    ]);
  });

  it('reports a queued self-test', () => {
    const { result, rerender } = renderHook(() => usePracticeRemindersScreen('s1'));

    testCallbacks.onSuccess({ enqueued: true, reason: null });
    rerender();

    expect(result.current.messages[0]?.text).toBe('practiceReminders.testQueued');
  });

  it('reports a quiet-hours refusal as an outcome, not a failure', () => {
    const { result, rerender } = renderHook(() => usePracticeRemindersScreen('s1'));

    testCallbacks.onSuccess({ enqueued: false, reason: 'quiet_hours' });
    rerender();

    expect(result.current.messages[0]?.text).toBe('practiceReminders.testQuietHours');
  });

  it('surfaces a refusal from either action as a failure message', () => {
    const { result, rerender } = renderHook(() => usePracticeRemindersScreen('s1'));

    dispatchCallbacks.onError(new Error('nope'));
    rerender();
    expect(result.current.messages[0]?.text).toBe('practiceReminders.actionFailed');

    testCallbacks.onError(new Error('nope'));
    rerender();
    expect(result.current.messages[0]?.text).toBe('practiceReminders.actionFailed');
  });

  /**
   * A member may read the agenda of a session they attend; who has not replied
   * is roster information.
   */
  it('withholds the screen from a principal without practice.manage', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: false,
    } as never);

    const { result } = renderHook(() => usePracticeRemindersScreen('s1'));

    expect(result.current.isForbidden).toBe(true);
  });

  it('does not call a principal forbidden while permissions are still resolving', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: true,
    } as never);

    const { result } = renderHook(() => usePracticeRemindersScreen('s1'));

    expect(result.current.isForbidden).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });
});
