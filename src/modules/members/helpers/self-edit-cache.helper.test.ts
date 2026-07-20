import { describe, expect, it } from 'vitest';

import { patchProfileOptimistically } from './self-edit-cache.helper';
import type { MemberProfile } from '../types/members.types';

const profile: MemberProfile = {
  membershipId: 'mem-1',
  teamId: 'team-1',
  audience: 'self',
  status: 'active',
  displayName: 'Old',
  nickname: null,
  positions: [],
  jerseyNumber: null,
  division: null,
  hasAvatar: false,
  preferredName: null,
  fullNameAr: null,
  gender: null,
  fullName: 'Old',
  jerseySize: null,
  email: null,
  phone: null,
  heightCm: null,
  weightKg: null,
  ageClassification: null,
  dateOfBirth: null,
  statusReason: null,
  version: 1,
};

describe('patchProfileOptimistically', () => {
  it('returns undefined when nothing is cached', () => {
    expect(
      patchProfileOptimistically(undefined, { fullName: 'x', nickname: null, jerseyNumber: null }),
    ).toBeUndefined();
  });

  it('patches identity fields including displayName', () => {
    const patched = patchProfileOptimistically(profile, {
      fullName: 'New',
      nickname: 'N',
      jerseyNumber: 9,
    });
    expect(patched).toMatchObject({
      displayName: 'New',
      fullName: 'New',
      nickname: 'N',
      jerseyNumber: 9,
    });
  });
});
