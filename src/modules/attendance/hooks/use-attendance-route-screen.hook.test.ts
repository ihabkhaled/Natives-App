import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';

import { useAttendanceScreen } from './use-attendance-screen.hook';
import { useAttendanceRouteScreen } from './use-attendance-route-screen.hook';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('./use-attendance-screen.hook', () => ({ useAttendanceScreen: vi.fn(() => ({})) }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAttendanceRouteScreen', () => {
  it('drives the screen from the route session id', () => {
    vi.mocked(useRouteParam).mockReturnValue('sess-1');

    renderHook(() => useAttendanceRouteScreen());

    expect(useAttendanceScreen).toHaveBeenCalledWith('sess-1');
  });

  it('defaults to an empty session id when the param is missing', () => {
    vi.mocked(useRouteParam).mockReturnValue(undefined);

    renderHook(() => useAttendanceRouteScreen());

    expect(useAttendanceScreen).toHaveBeenCalledWith('');
  });
});
