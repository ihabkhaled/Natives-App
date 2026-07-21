import { describe, expect, it } from 'vitest';

import { mergePermissionSets } from './effective-permissions.helper';

describe('mergePermissionSets', () => {
  it('unions the two sources rather than letting either win', () => {
    // A super administrator's platform grants arrive globally; a team
    // administrator's arrive only in scope. Neither set is a superset.
    expect(mergePermissionSets(['team.browse.all'], ['member.list'])).toEqual([
      'member.list',
      'team.browse.all',
    ]);
  });

  it('de-duplicates a permission both sources report', () => {
    expect(mergePermissionSets(['team.read'], ['team.read', 'member.list'])).toEqual([
      'member.list',
      'team.read',
    ]);
  });

  it('sorts the result so it is stable to compare', () => {
    expect(mergePermissionSets(['z.read'], ['a.read', 'm.read'])).toEqual([
      'a.read',
      'm.read',
      'z.read',
    ]);
  });

  it('falls back to whichever source has anything', () => {
    expect(mergePermissionSets(['team.read'], [])).toEqual(['team.read']);
    expect(mergePermissionSets([], ['member.list'])).toEqual(['member.list']);
    expect(mergePermissionSets([], [])).toEqual([]);
  });
});
