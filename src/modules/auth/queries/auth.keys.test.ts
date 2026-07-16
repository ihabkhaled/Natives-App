import { describe, expect, it } from 'vitest';

import { authQueryKeys } from './auth.keys';

describe('authQueryKeys', () => {
  it('roots every auth key under a single namespace', () => {
    expect(authQueryKeys.all).toEqual(['auth']);
  });

  it('composes the current-user key from the namespace root', () => {
    expect(authQueryKeys.currentUser()).toEqual(['auth', 'current-user']);
    expect(authQueryKeys.currentUser().slice(0, 1)).toEqual([...authQueryKeys.all]);
  });

  it('returns a fresh array per call so callers cannot mutate the root', () => {
    expect(authQueryKeys.currentUser()).not.toBe(authQueryKeys.currentUser());
    expect(authQueryKeys.currentUser()).toEqual(authQueryKeys.currentUser());
  });
});
