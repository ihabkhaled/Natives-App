import { act, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { confirmResult } from '../../../../tests/setup/confirm-alert-stub.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import type { SettingVersion } from '../types/admin.types';
import { useCancelSettingVersion } from './use-cancel-setting-version.hook';

/**
 * Ionic presents confirmations in an overlay jsdom cannot drive; only the
 * confirmation is stubbed. The mutation runs for real — and, with no HTTP
 * client configured here, fails, which is exactly the refusal path under
 * test. The success and not-cancellable paths run in the integration suite.
 */
vi.mock('@/shared/ui', async (importOriginal) => {
  const { withConfirmStub } = await import('../../../../tests/setup/confirm-alert-stub.helper');
  const sharedUi = await importOriginal<Record<string, unknown>>();
  return withConfirmStub(sharedUi);
});

const SCHEDULED: SettingVersion = {
  id: 'sv-cancel-1',
  settingKey: 'badge_tiers',
  effectiveFrom: '2026-09-01T00:00:00.000Z',
  value: { state: 'legacy', raw: {} },
  note: null,
  createdBy: null,
  createdAt: '2026-07-01T00:00:00.000Z',
};

beforeAll(async () => {
  await initTestI18n();
});

/** Request one cancel and report the busy marker once the hook settles. */
async function cancelAndSettle(): Promise<string | null> {
  const { result } = renderHookWithProviders(() => useCancelSettingVersion('team-1'));

  act(() => {
    result.current.cancel(SCHEDULED, '1 September 2026');
  });

  await waitFor(() => {
    if (result.current.cancellingId !== null) {
      throw new Error('cancel is still marked busy');
    }
  });
  return result.current.cancellingId;
}

describe('useCancelSettingVersion', () => {
  it('does nothing when the admin keeps the scheduled change', async () => {
    confirmResult.value = false;
    try {
      expect(await cancelAndSettle()).toBeNull();
    } finally {
      confirmResult.value = true;
    }
  });

  it('recovers from a failed cancel and clears the busy marker', async () => {
    // The unconfigured client refuses immediately; the hook must settle back
    // to idle rather than leaving the entry stuck in its busy state.
    expect(await cancelAndSettle()).toBeNull();
  });
});
