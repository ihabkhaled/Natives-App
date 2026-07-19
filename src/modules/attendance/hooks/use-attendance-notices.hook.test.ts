import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';
import { useAppToast } from '@/shared/ui';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useAttendanceNotices } from './use-attendance-notices.hook';

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

const showToast = vi.fn<() => Promise<void>>();

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue();
  vi.mocked(useAppToast).mockReturnValue({ showToast });
});

afterEach(() => {
  vi.clearAllMocks();
});

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
