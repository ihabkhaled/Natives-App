import { describe, expect, it } from 'vitest';

import { buildAuthUser } from './auth.factory';

describe('buildAuthUser', () => {
  it('builds the deterministic default user', () => {
    expect(buildAuthUser()).toEqual({
      id: 'user-1',
      email: 'ranger@example.com',
      displayName: 'Ranger One',
    });
  });

  it('applies overrides on top of the defaults', () => {
    expect(buildAuthUser({ id: 'user-2', displayName: 'Ranger Two' })).toEqual({
      id: 'user-2',
      email: 'ranger@example.com',
      displayName: 'Ranger Two',
    });
  });
});
