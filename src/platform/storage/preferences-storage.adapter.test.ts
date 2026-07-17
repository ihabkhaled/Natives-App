import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPreferenceValue,
  removePreferenceValue,
  setPreferenceValue,
} from '@/packages/capacitor-preferences';
import { STORAGE_KEYS } from '@/shared/config';

import { createPreferencesStorageAdapter } from './preferences-storage.adapter';

vi.mock('@/packages/capacitor-preferences', () => ({
  getPreferenceValue: vi.fn(),
  removePreferenceValue: vi.fn(),
  setPreferenceValue: vi.fn(),
}));

const getPreferenceValueMock = vi.mocked(getPreferenceValue);
const setPreferenceValueMock = vi.mocked(setPreferenceValue);
const removePreferenceValueMock = vi.mocked(removePreferenceValue);

beforeEach(() => {
  vi.clearAllMocks();
  getPreferenceValueMock.mockResolvedValue(null);
  setPreferenceValueMock.mockResolvedValue(undefined);
  removePreferenceValueMock.mockResolvedValue(undefined);
});

describe('createPreferencesStorageAdapter', () => {
  it('exposes the persisted-store storage contract', () => {
    const adapter = createPreferencesStorageAdapter();

    expect(Object.keys(adapter).sort()).toEqual(['getItem', 'removeItem', 'setItem']);
  });

  it('reads through to Capacitor Preferences', async () => {
    getPreferenceValueMock.mockResolvedValue('{"theme":"dark"}');

    await expect(createPreferencesStorageAdapter().getItem(STORAGE_KEYS.settings)).resolves.toBe(
      '{"theme":"dark"}',
    );
    expect(getPreferenceValueMock).toHaveBeenCalledExactlyOnceWith(STORAGE_KEYS.settings);
  });

  it('returns null for a missing entry', async () => {
    await expect(
      createPreferencesStorageAdapter().getItem(STORAGE_KEYS.settings),
    ).resolves.toBeNull();
  });

  it('writes through to Capacitor Preferences', async () => {
    await createPreferencesStorageAdapter().setItem(STORAGE_KEYS.settings, '{"theme":"light"}');

    expect(setPreferenceValueMock).toHaveBeenCalledExactlyOnceWith(
      STORAGE_KEYS.settings,
      '{"theme":"light"}',
    );
  });

  it('removes through to Capacitor Preferences', async () => {
    await createPreferencesStorageAdapter().removeItem(STORAGE_KEYS.settings);

    expect(removePreferenceValueMock).toHaveBeenCalledExactlyOnceWith(STORAGE_KEYS.settings);
  });

  it('propagates a storage failure to the caller', async () => {
    getPreferenceValueMock.mockRejectedValue(new Error('preferences unavailable'));

    await expect(createPreferencesStorageAdapter().getItem(STORAGE_KEYS.settings)).rejects.toThrow(
      'preferences unavailable',
    );
  });
});
