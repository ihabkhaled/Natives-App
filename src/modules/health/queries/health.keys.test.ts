import { describe, expect, it } from 'vitest';

import { healthQueryKeys } from './health.keys';

describe('healthQueryKeys', () => {
  it('roots every health key under a single namespace', () => {
    expect(healthQueryKeys.all).toEqual(['health']);
  });

  it('composes the status key from the namespace root', () => {
    expect(healthQueryKeys.status()).toEqual(['health', 'status']);
    expect(healthQueryKeys.status().slice(0, 1)).toEqual([...healthQueryKeys.all]);
  });

  it('returns a fresh array per call so callers cannot mutate the root', () => {
    expect(healthQueryKeys.status()).not.toBe(healthQueryKeys.status());
    expect(healthQueryKeys.status()).toEqual(healthQueryKeys.status());
  });
});
