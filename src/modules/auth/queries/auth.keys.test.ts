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

  it('scopes the invitation key by token and roots it under the namespace', () => {
    expect(authQueryKeys.invitation('abc')).toEqual(['auth', 'invitation', 'abc']);
    expect(authQueryKeys.invitation('abc')).not.toEqual(authQueryKeys.invitation('def'));
  });

  it('composes the sessions key from the namespace root', () => {
    expect(authQueryKeys.sessions()).toEqual(['auth', 'sessions']);
    expect(authQueryKeys.sessions().slice(0, 1)).toEqual([...authQueryKeys.all]);
  });
});
