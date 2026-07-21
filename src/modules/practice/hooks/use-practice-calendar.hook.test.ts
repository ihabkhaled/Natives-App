import { act, renderHook } from '@testing-library/react';
import { createStorageAdapterStub } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { buildPracticeSessionListPage } from '../../../../tests/factories/practice.factory';
import { PRACTICE_SCOPE } from '../constants/practice.constants';
import { usePracticeCalendar } from './use-practice-calendar.hook';
import { usePracticeSessionsQuery } from './use-practice-sessions-query.hook';
import { usePracticeTeamContext } from './use-practice-team-context.hook';

const push = vi.fn();

vi.mock('./use-practice-sessions-query.hook', () => ({ usePracticeSessionsQuery: vi.fn() }));
vi.mock('./use-practice-team-context.hook', () => ({ usePracticeTeamContext: vi.fn() }));
// The auth module's persisted active-team store reaches the Preferences
// adapter through @/platform, so a partial mock of it must still provide one.
vi.mock('@/platform', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
  createPreferencesStorageAdapter: createStorageAdapterStub,
}));
vi.mock('@/packages/router', () => ({
  useAppNavigation: vi.fn(() => ({ push, replace: vi.fn(), goBack: vi.fn(), currentPath: '/' })),
}));

function lastParams() {
  return vi.mocked(usePracticeSessionsQuery).mock.calls.at(-1)?.[1];
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(usePracticeTeamContext).mockReturnValue({
    teamId: 'team-1',
    isLoading: false,
    isError: false,
  });
  vi.mocked(usePracticeSessionsQuery).mockReturnValue({
    page: buildPracticeSessionListPage({ hasMore: true }),
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeCalendar', () => {
  it('defaults to the upcoming scope with the base page size', () => {
    renderHook(() => usePracticeCalendar());

    expect(vi.mocked(usePracticeSessionsQuery).mock.calls[0]?.[0]).toBe('team-1');
    expect(lastParams()).toMatchObject({ scope: PRACTICE_SCOPE.upcoming, pageSize: 20 });
  });

  it('grows the page size on load more and resets it on a filter change', () => {
    const { result } = renderHook(() => usePracticeCalendar());

    act(() => {
      result.current.onLoadMore();
    });
    expect(lastParams()?.pageSize).toBe(40);

    act(() => {
      result.current.filter.onScopeChange(PRACTICE_SCOPE.past);
    });
    expect(lastParams()).toMatchObject({ scope: PRACTICE_SCOPE.past, pageSize: 20 });
  });

  it('navigates to the session detail on selection', () => {
    const { result } = renderHook(() => usePracticeCalendar());

    act(() => {
      result.current.onSelectSession('sess-9');
    });

    expect(push).toHaveBeenCalledWith('/practices/sess-9');
  });
});
