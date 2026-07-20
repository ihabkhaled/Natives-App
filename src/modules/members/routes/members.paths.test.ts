import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  MEMBER_MEMBERSHIP_ID_PARAM,
  memberProfilePath,
  memberProfilePattern,
  membersPath,
} from './members.paths';

describe('members.paths', () => {
  it('exposes the directory and profile route patterns', () => {
    expect(membersPath()).toBe(APP_PATHS.members);
    expect(memberProfilePattern()).toBe(APP_PATHS.memberProfile);
    expect(MEMBER_MEMBERSHIP_ID_PARAM).toBe('membershipId');
  });

  it('builds a concrete, encoded profile path', () => {
    expect(memberProfilePath('mem/7')).toBe('/members/mem%2F7');
  });
});
