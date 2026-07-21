import { act } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as RouterModule from '@/packages/router';
import { buildEmptyRemoteQuery, MATCH_CONTEXT_STUB } from '@/tests/msw/matches-view.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useMatchRosterQuery } from './use-match-roster-query.hook';
import { useMatchStatisticsQuery } from './use-match-statistics-query.hook';
import { useMatchStatisticsScreen } from './use-match-statistics-screen.hook';
import { useMatchesContext } from './use-matches-context.hook';

const { push, routeParam } = vi.hoisted(() => ({
  push: vi.fn(),
  routeParam: { current: undefined as string | undefined },
}));
const MATCH_ID = '21000000-0000-4000-8000-000000000001';

vi.mock('@/packages/router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useAppNavigation: () => ({ push, replace: vi.fn(), goBack: vi.fn() }),
  useRouteParam: () => routeParam.current,
}));
vi.mock('./use-matches-context.hook', () => ({ useMatchesContext: vi.fn() }));
vi.mock('./use-match-statistics-query.hook', () => ({ useMatchStatisticsQuery: vi.fn() }));
vi.mock('./use-match-roster-query.hook', () => ({ useMatchRosterQuery: vi.fn() }));

beforeAll(async () => {
  await initTestI18n();
});

/** Neither the projection nor the directory has answered yet. */
function mockUnresolvedReads(): void {
  routeParam.current = MATCH_ID;
  vi.mocked(useMatchesContext).mockReturnValue({ ...MATCH_CONTEXT_STUB });
  vi.mocked(useMatchStatisticsQuery).mockReturnValue(buildEmptyRemoteQuery(vi.fn()));
  vi.mocked(useMatchRosterQuery).mockReturnValue(buildEmptyRemoteQuery(vi.fn()));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUnresolvedReads();
});

describe('useMatchStatisticsScreen', () => {
  it('waits rather than showing an empty table while nothing has loaded', () => {
    const { result } = renderHookWithProviders(() => useMatchStatisticsScreen());

    expect(result.current.status).toBe('loading');
    expect(result.current.playerRows).toStrictEqual([]);
    // The video gap is stated even with nothing else to show.
    expect(result.current.video.title).toBe('Video analysis is not available yet');
  });

  it('reads nothing at all when the route carries no match id', () => {
    routeParam.current = undefined;

    const { result } = renderHookWithProviders(() => useMatchStatisticsScreen());

    expect(result.current.playerRows).toStrictEqual([]);
  });

  it('navigates back to the match list', () => {
    const { result } = renderHookWithProviders(() => useMatchStatisticsScreen());

    act(() => {
      result.current.onBack();
    });

    expect(push).toHaveBeenCalledWith('/matches');
  });

  it('opens and closes a player report', () => {
    const { result } = renderHookWithProviders(() => useMatchStatisticsScreen());

    act(() => {
      result.current.onOpenReport('mem-omar');
    });
    expect(result.current.report).toBeNull();

    act(() => {
      result.current.onCloseReport();
    });
    expect(result.current.report).toBeNull();
  });
});
