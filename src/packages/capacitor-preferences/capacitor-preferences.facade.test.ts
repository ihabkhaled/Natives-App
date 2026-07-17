import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPreferenceValue,
  removePreferenceValue,
  setPreferenceValue,
} from './capacitor-preferences.facade';

const { get, set, remove } = vi.hoisted(() => ({
  get: vi.fn<(options: { key: string }) => Promise<{ value: string | null }>>(),
  set: vi.fn<(options: { key: string; value: string }) => Promise<void>>(),
  remove: vi.fn<(options: { key: string }) => Promise<void>>(),
}));

vi.mock('@capacitor/preferences', () => ({ Preferences: { get, set, remove } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPreferenceValue', () => {
  it('unwraps the stored value', async () => {
    get.mockResolvedValue({ value: 'dark' });

    await expect(getPreferenceValue('theme')).resolves.toBe('dark');
    expect(get).toHaveBeenCalledExactlyOnceWith({ key: 'theme' });
  });

  it('reports an unknown key as null', async () => {
    get.mockResolvedValue({ value: null });

    await expect(getPreferenceValue('theme')).resolves.toBeNull();
  });

  it('preserves an empty stored string', async () => {
    get.mockResolvedValue({ value: '' });

    await expect(getPreferenceValue('theme')).resolves.toBe('');
  });
});

describe('setPreferenceValue', () => {
  it('writes the key and value through the plugin', async () => {
    await setPreferenceValue('theme', 'dark');

    expect(set).toHaveBeenCalledExactlyOnceWith({ key: 'theme', value: 'dark' });
  });

  it('propagates a plugin failure', async () => {
    set.mockRejectedValue(new Error('quota exceeded'));

    await expect(setPreferenceValue('theme', 'dark')).rejects.toThrow('quota exceeded');
  });
});

describe('removePreferenceValue', () => {
  it('removes the key through the plugin', async () => {
    await removePreferenceValue('theme');

    expect(remove).toHaveBeenCalledExactlyOnceWith({ key: 'theme' });
  });
});
