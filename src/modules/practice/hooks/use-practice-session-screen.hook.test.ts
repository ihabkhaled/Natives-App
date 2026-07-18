import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';

import { buildPracticeSessionScreenView } from '../../../../tests/factories/practice-view.factory';
import { usePracticeSessionDetails } from './use-practice-session-details.hook';
import { usePracticeSessionScreen } from './use-practice-session-screen.hook';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('./use-practice-session-details.hook', () => ({ usePracticeSessionDetails: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeSessionScreen', () => {
  it('prepares the routed practice session', () => {
    const view = buildPracticeSessionScreenView();
    vi.mocked(useRouteParam).mockReturnValue('sess-1');
    vi.mocked(usePracticeSessionDetails).mockReturnValue(view);

    const { result } = renderHook(() => usePracticeSessionScreen());

    expect(usePracticeSessionDetails).toHaveBeenCalledExactlyOnceWith('sess-1');
    expect(result.current).toBe(view);
  });

  it('uses an empty id when the route parameter is absent', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(usePracticeSessionDetails).mockReturnValue(buildPracticeSessionScreenView());

    renderHook(() => usePracticeSessionScreen());

    expect(usePracticeSessionDetails).toHaveBeenCalledExactlyOnceWith('');
  });
});
