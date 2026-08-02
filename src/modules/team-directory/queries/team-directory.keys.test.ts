import { describe, expect, it } from 'vitest';

import { teamDirectoryQueryKeys } from './team-directory.keys';

describe('teamDirectoryQueryKeys', () => {
  it('namespaces every key under the module root', () => {
    expect(teamDirectoryQueryKeys.all).toEqual(['team-directory']);
  });

  it('scopes a directory read to its team slug', () => {
    expect(teamDirectoryQueryKeys.bySlug('ultimate-natives')).toEqual([
      'team-directory',
      'ultimate-natives',
    ]);
  });

  it('keeps two teams in separate cache entries', () => {
    expect(teamDirectoryQueryKeys.bySlug('a')).not.toEqual(teamDirectoryQueryKeys.bySlug('b'));
  });
});
