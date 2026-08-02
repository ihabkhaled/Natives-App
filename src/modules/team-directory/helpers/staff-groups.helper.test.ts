import { describe, expect, it } from 'vitest';

import { STAFF_TITLE_ORDER } from '../team-directory.constants';
import type { TeamStaffMember } from '../types/team-directory.types';
import { groupStaffByTitle } from './staff-groups.helper';

function member(overrides: Partial<TeamStaffMember> = {}): TeamStaffMember {
  return {
    id: 'staff-1',
    displayName: 'Sherif Ashraf',
    nickname: '3alamy',
    titles: ['coach'],
    photoUrl: null,
    ...overrides,
  };
}

const ORDER = [...STAFF_TITLE_ORDER];

describe('groupStaffByTitle', () => {
  it('returns nothing for an empty board', () => {
    expect(groupStaffByTitle([], ORDER)).toEqual([]);
  });

  it('keeps the declared display order regardless of input order', () => {
    const groups = groupStaffByTitle(
      [
        member({ id: 'finance', titles: ['finance'] }),
        member({ id: 'coach', titles: ['coach'] }),
        member({ id: 'spirit', titles: ['spirit-captain'] }),
      ],
      ORDER,
    );

    expect(groups.map((group) => group.titleCode)).toEqual(['coach', 'spirit-captain', 'finance']);
  });

  it('lists a person once under every responsibility they hold', () => {
    const hobz = member({ id: 'hobz', titles: ['analysis', 'technical', 'co-coach'] });

    const groups = groupStaffByTitle([hobz], ORDER);

    expect(groups.map((group) => group.titleCode)).toEqual(['co-coach', 'analysis', 'technical']);
    for (const group of groups) {
      expect(group.members).toEqual([hobz]);
    }
  });

  it('collects everyone who shares one responsibility into the same group', () => {
    const groups = groupStaffByTitle(
      [
        member({ id: 'doda', titles: ['co-coach'] }),
        member({ id: 'roo', titles: ['co-coach'] }),
        member({ id: 'hobz', titles: ['co-coach'] }),
      ],
      ORDER,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.members.map((entry) => entry.id)).toEqual(['doda', 'roo', 'hobz']);
  });

  it('drops groups nobody holds', () => {
    const groups = groupStaffByTitle([member()], ORDER);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.titleCode).toBe('coach');
  });

  it('files an unknown title code under the trailing staff bucket', () => {
    const groups = groupStaffByTitle([member({ id: 'mai', titles: ['logistics'] })], ORDER);

    expect(groups.map((group) => group.titleCode)).toEqual(['other']);
  });

  it('keeps the unknown bucket last, after every known responsibility', () => {
    const groups = groupStaffByTitle(
      [member({ id: 'mai', titles: ['logistics'] }), member()],
      ORDER,
    );

    expect(groups.map((group) => group.titleCode)).toEqual(['coach', 'other']);
  });

  it('never loses a person who carries no title at all', () => {
    const groups = groupStaffByTitle([member({ id: 'unassigned', titles: [] })], ORDER);

    expect(groups[0]?.titleCode).toBe('other');
    expect(groups[0]?.members).toHaveLength(1);
  });

  it('lists a person once per group even when a title repeats', () => {
    const groups = groupStaffByTitle([member({ id: 'dupe', titles: ['coach', 'coach'] })], ORDER);

    expect(groups[0]?.members).toHaveLength(1);
  });

  it('collapses several unknown titles on one person into a single entry', () => {
    const groups = groupStaffByTitle(
      [member({ id: 'mai', titles: ['logistics', 'catering'] })],
      ORDER,
    );

    expect(groups[0]?.members).toHaveLength(1);
  });
});
