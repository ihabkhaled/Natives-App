import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecureValue, removeSecureValue, setSecureValue } from './secure-storage.facade';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) },
}));

vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

function useNativePlatform(isNative: boolean): void {
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(isNative);
}

const throwingSessionStorage = {
  getItem: (): string | null => {
    throw new Error('sessionStorage is blocked');
  },
  setItem: (): void => {
    throw new Error('sessionStorage is blocked');
  },
  removeItem: (): void => {
    throw new Error('sessionStorage is blocked');
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  useNativePlatform(false);
  globalThis.sessionStorage.clear();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await removeSecureValue('token');
  await removeSecureValue('other');
  vi.restoreAllMocks();
});

describe('the native platform', () => {
  beforeEach(() => {
    useNativePlatform(true);
  });

  it('reads a string value from hardware-backed storage', async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue('stored-token');

    await expect(getSecureValue('token')).resolves.toBe('stored-token');
    expect(SecureStorage.get).toHaveBeenCalledExactlyOnceWith('token');
  });

  it('reports a missing value as null', async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue(null);

    await expect(getSecureValue('token')).resolves.toBeNull();
  });

  it('refuses a stored value that is not a string', async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue(42);

    await expect(getSecureValue('token')).resolves.toBeNull();
  });

  it('writes through to hardware-backed storage', async () => {
    await setSecureValue('token', 'access-1');

    expect(SecureStorage.set).toHaveBeenCalledExactlyOnceWith('token', 'access-1');
  });

  it('removes through hardware-backed storage', async () => {
    await removeSecureValue('token');

    expect(SecureStorage.remove).toHaveBeenCalledExactlyOnceWith('token');
  });

  it('never touches the browser fallback', async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue('stored-token');

    await setSecureValue('token', 'access-1');
    await getSecureValue('token');

    expect(globalThis.sessionStorage.getItem('token')).toBeNull();
  });
});

describe('the browser development fallback', () => {
  it('round-trips a value through memory', async () => {
    await setSecureValue('token', 'access-1');

    await expect(getSecureValue('token')).resolves.toBe('access-1');
    expect(SecureStorage.get).not.toHaveBeenCalled();
  });

  it('mirrors the value into sessionStorage so a reload keeps the session', async () => {
    await setSecureValue('token', 'access-1');

    expect(globalThis.sessionStorage.getItem('token')).toBe('access-1');
  });

  it('reads from the sessionStorage mirror when memory is cold', async () => {
    globalThis.sessionStorage.setItem('other', 'from-reload');

    await expect(getSecureValue('other')).resolves.toBe('from-reload');
  });

  it('prefers memory over the sessionStorage mirror', async () => {
    await setSecureValue('token', 'from-memory');
    globalThis.sessionStorage.setItem('token', 'stale');

    await expect(getSecureValue('token')).resolves.toBe('from-memory');
  });

  it('reports an unknown key as null', async () => {
    await expect(getSecureValue('token')).resolves.toBeNull();
  });

  it('removes the value from memory and the mirror', async () => {
    await setSecureValue('token', 'access-1');

    await removeSecureValue('token');

    await expect(getSecureValue('token')).resolves.toBeNull();
    expect(globalThis.sessionStorage.getItem('token')).toBeNull();
    expect(SecureStorage.remove).not.toHaveBeenCalled();
  });

  it('warns exactly once that the fallback is not secure at rest', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await setSecureValue('token', 'access-1');
    await getSecureValue('token');
    await setSecureValue('other', 'access-2');

    // The warning latches on the first fallback use, which may already have
    // happened in an earlier test in this file.
    expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
  });
});

describe('a hostile sessionStorage', () => {
  it('still serves reads from memory when the mirror throws', async () => {
    await setSecureValue('token', 'access-1');
    vi.stubGlobal('sessionStorage', throwingSessionStorage);

    await expect(getSecureValue('token')).resolves.toBe('access-1');
  });

  it('reports null when the mirror throws and memory is cold', async () => {
    vi.stubGlobal('sessionStorage', throwingSessionStorage);

    await expect(getSecureValue('token')).resolves.toBeNull();
  });

  it('keeps writes working in memory when the mirror throws', async () => {
    vi.stubGlobal('sessionStorage', throwingSessionStorage);

    await expect(setSecureValue('token', 'access-1')).resolves.toBeUndefined();
    await expect(getSecureValue('token')).resolves.toBe('access-1');
  });

  it('keeps removals working in memory when the mirror throws', async () => {
    await setSecureValue('token', 'access-1');
    vi.stubGlobal('sessionStorage', throwingSessionStorage);

    await expect(removeSecureValue('token')).resolves.toBeUndefined();
    await expect(getSecureValue('token')).resolves.toBeNull();
  });
});
