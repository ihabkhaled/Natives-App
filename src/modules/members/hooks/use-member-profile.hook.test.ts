import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useMemberProfile } from './use-member-profile.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

vi.mock('@/shared/ui', () => ({
  useAppToast: () => ({ showToast: vi.fn() }),
  useConfirmAlert: () => ({ confirm: vi.fn() }),
}));

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberProfile', () => {
  it('builds the profile view and wires back navigation without a route param', async () => {
    const { result } = renderHookWithProviders(() => useMemberProfile());
    await waitFor(() => {
      expect(result.current.title.length).toBeGreaterThan(0);
    });
    expect(result.current.header).toBeNull();
    act(() => {
      result.current.onBack();
    });
  });
});
