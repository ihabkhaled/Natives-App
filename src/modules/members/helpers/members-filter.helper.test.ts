import { describe, expect, it } from 'vitest';

import { collectPositionOptions, filterDirectoryItems } from './members-filter.helper';
import type { MemberDirectoryItem } from '../types/members.types';

const items: readonly MemberDirectoryItem[] = [
  {
    membershipId: 'a',
    teamId: 't',
    status: 'active',
    displayName: 'Omar Hassan',
    nickname: 'O',
    jerseyNumber: 7,
    positions: ['handler', 'cutter'],
    hasAvatar: false,
  },
  {
    membershipId: 'b',
    teamId: 't',
    status: 'invited',
    displayName: 'Sara',
    nickname: null,
    jerseyNumber: null,
    positions: ['deep'],
    hasAvatar: false,
  },
];

describe('members-filter.helper', () => {
  it('matches on name, nickname, jersey, and positions', () => {
    expect(
      filterDirectoryItems(items, { search: 'omar', status: null, position: null }),
    ).toHaveLength(1);
    expect(filterDirectoryItems(items, { search: '7', status: null, position: null })).toHaveLength(
      1,
    );
    expect(filterDirectoryItems(items, { search: '', status: null, position: null })).toHaveLength(
      2,
    );
  });

  it('filters by status and position', () => {
    expect(
      filterDirectoryItems(items, { search: '', status: 'invited', position: null }),
    ).toHaveLength(1);
    expect(
      filterDirectoryItems(items, { search: '', status: null, position: 'deep' }),
    ).toHaveLength(1);
  });

  it('collects sorted distinct positions', () => {
    expect(collectPositionOptions(items)).toEqual(['cutter', 'deep', 'handler']);
  });
});
