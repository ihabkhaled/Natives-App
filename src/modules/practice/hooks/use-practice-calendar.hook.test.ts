import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { buildPracticeSessionListPage } from '../../../../tests/factories/practice.factory';
import { PRACTICE_SCOPE } from '../constants/practice.constants';
import { usePracticeCalendar } from './use-practice-calendar.hook';
import { usePracticeSessionsQuery } from './use-practice-sessions-query.hook';

const push = vi.fn();

vi.mock('./use-practice-sessions-query.hook', () => ({ usePracticeSessionsQuery: vi.fn() }));
vi.mock('@/platform', () => ({ useNetworkStatus: vi.fn(() => ({ isOnline: true })) }));
vi.mock('@/packages/router', () => ({
  useAppNavigation: vi.fn(() => ({ push, replace: vi.fn(), goBack: vi.fn(), currentPath: '/' })),
}));

function lastParams() {
  return vi.mocked(usePracticeSessionsQuery).mock.calls.at(-1)?.[0];
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
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
