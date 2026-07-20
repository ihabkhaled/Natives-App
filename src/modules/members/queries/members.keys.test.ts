import { describe, expect, it } from 'vitest';

import { membersQueryKeys } from './members.keys';

describe('membersQueryKeys', () => {
  it('scopes every key by team and membership', () => {
    expect(membersQueryKeys.all).toEqual(['members']);
    expect(membersQueryKeys.team('t')).toEqual(['members', 'team', 't']);
    expect(membersQueryKeys.directory('t', { pageSize: 20 })).toEqual([
      'members',
      'team',
      't',
      'directory',
      { pageSize: 20 },
    ]);
    expect(membersQueryKeys.member('t', 'm')).toEqual(['members', 'team', 't', 'member', 'm']);
    expect(membersQueryKeys.history('t', 'm').at(-1)).toBe('history');
    expect(membersQueryKeys.aliases('t', 'm').at(-1)).toBe('aliases');
    expect(membersQueryKeys.roles('t', 'm').at(-1)).toBe('roles');
    expect(membersQueryKeys.avatar('t', 'm').at(-1)).toBe('avatar');
  });
});
