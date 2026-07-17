import { vi } from 'vitest';

import type * as SecureStorageModule from '@/packages/secure-storage';

/**
 * In-memory stand-in for the secure-storage package: values survive within a
 * test file, and every facade function is spied so tests can assert the keys
 * it was called with.
 *
 * `vi.mock` factories are hoisted and their module paths resolve relative to
 * the importing file, so each test file keeps its own `vi.mock` call and pulls
 * this implementation in from inside the factory:
 *
 * ```ts
 * vi.mock('@/packages/secure-storage', async () => {
 *   const { createSecureStorageDouble } = await import('<rel>/secure-storage-double.helper');
 *   return createSecureStorageDouble();
 * });
 * ```
 */
export function createSecureStorageDouble(): typeof SecureStorageModule {
  const values = new Map<string, string>();
  return {
    getSecureValue: vi.fn((key: string) => Promise.resolve(values.get(key) ?? null)),
    setSecureValue: vi.fn((key: string, value: string) => {
      values.set(key, value);
      return Promise.resolve();
    }),
    removeSecureValue: vi.fn((key: string) => {
      values.delete(key);
      return Promise.resolve();
    }),
  };
}
