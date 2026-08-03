import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';

import { usePracticeAgendaRouteScreen } from './use-practice-agenda-route-screen.hook';
import { usePracticeAgendaScreen } from './use-practice-agenda-screen.hook';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('./use-practice-agenda-screen.hook', () => ({
  usePracticeAgendaScreen: vi.fn(() => ({})),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeAgendaRouteScreen', () => {
  it('drives the plan from the routed session id', () => {
    vi.mocked(useRouteParam).mockReturnValue('session-1');

    renderHook(() => usePracticeAgendaRouteScreen());

    expect(usePracticeAgendaScreen).toHaveBeenCalledWith('session-1');
  });

  it('falls back to an empty session id, which the query refuses to read', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);

    renderHook(() => usePracticeAgendaRouteScreen());

    expect(usePracticeAgendaScreen).toHaveBeenCalledWith('');
  });
});
