import { afterEach, beforeAll, beforeEach, type Mock, vi } from 'vitest';

import { useAppToast, type ShowToastOptions } from '@/shared/ui';

import { initTestI18n } from './i18n-test.helper';

interface ToastHarness {
  readonly showToast: Mock<(options: ShowToastOptions) => Promise<void>>;
}

/**
 * Registers the standard toast-owner test lifecycle used by hooks that raise
 * toasts: real i18n copy, a fresh resolved `showToast` spy per test, and mock
 * cleanup. The caller keeps its own file-local `vi.mock('@/shared/ui', …)` (mock
 * factories are hoisted per file); this only wires the shared hooks and returns
 * the spy so tests can assert on the toasts their hook raised.
 */
export function setupToastHarness(): ToastHarness {
  const showToast = vi.fn<(options: ShowToastOptions) => Promise<void>>();

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

  return { showToast };
}
