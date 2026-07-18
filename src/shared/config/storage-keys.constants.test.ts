import { describe, expect, it } from 'vitest';

import { APP_IDENTITY } from './app-identity.constants';
import { STORAGE_KEYS } from './storage-keys.constants';

const KEY_PREFIX = `${APP_IDENTITY.appSlug}.`;

describe('STORAGE_KEYS', () => {
  it('pins every persisted key', () => {
    expect(STORAGE_KEYS).toEqual({
      settings: 'ultimate-natives.settings.v1',
      authAccessToken: 'ultimate-natives.auth.access-token',
      authRefreshToken: 'ultimate-natives.auth.refresh-token',
    });
  });

  it('namespaces every key with the app slug', () => {
    const unprefixed = Object.values(STORAGE_KEYS).filter((key) => !key.startsWith(KEY_PREFIX));
    expect(unprefixed).toEqual([]);
  });

  it('keeps every key unique so stores never collide', () => {
    const values = Object.values(STORAGE_KEYS);
    expect(new Set(values).size).toBe(values.length);
  });

  it('keeps a namespace segment after the app prefix', () => {
    const missingNamespace = Object.values(STORAGE_KEYS).filter(
      (key) => key.slice(KEY_PREFIX.length) === '',
    );
    expect(missingNamespace).toEqual([]);
  });
});
