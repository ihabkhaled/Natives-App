import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { makeAttendanceSheet } from '@/tests/msw/attendance-domain.fixture';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { listAttendance } from '../services/list-attendance.service';
import { useAttendanceSheetQuery } from './use-attendance-sheet-query.hook';

vi.mock('../services/list-attendance.service', () => ({ listAttendance: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAttendanceSheetQuery', () => {
  it('exposes the loaded sheet and allows a manual refetch', async () => {
    vi.mocked(listAttendance).mockResolvedValue(makeAttendanceSheet());

    const { result } = renderHookWithProviders(() => useAttendanceSheetQuery('team-1', 'sess-1'));

    await waitFor(() => {
      expect(result.current.sheet).toBeDefined();
    });
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => {
      expect(listAttendance).toHaveBeenCalledTimes(2);
    });
  });

  it('surfaces a load failure as an AppError', async () => {
    vi.mocked(listAttendance).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Forbidden }));

    const { result } = renderHookWithProviders(() => useAttendanceSheetQuery('team-1', 'sess-1'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Forbidden);
  });
});
