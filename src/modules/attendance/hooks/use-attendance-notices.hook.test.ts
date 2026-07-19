import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';

import { setupToastHarness } from '../../../../tests/setup/toast-test.helper';
import { useAttendanceNotices } from './use-attendance-notices.hook';

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

const { showToast } = setupToastHarness();

describe('useAttendanceNotices', () => {
  it('raises a toned toast for each attendance outcome', () => {
    const { result } = renderHook(() => useAttendanceNotices());

    result.current.saved(3);
    result.current.queued(2);
    result.current.failed();
    result.current.finalized();
    result.current.corrected();

    expect(showToast).toHaveBeenCalledTimes(5);
    const tones = showToast.mock.calls.map((call) => (call[0] as { tone: string }).tone);
    expect(tones).toEqual(['success', 'warning', 'danger', 'success', 'success']);
  });
});
