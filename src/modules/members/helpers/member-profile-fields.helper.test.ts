import { describe, expect, it } from 'vitest';

import { buildProfileFields } from './member-profile-fields.helper';
import type { MemberProfile } from '../types/members.types';

const t = (key: string): string => key;

const empty: MemberProfile = {
  membershipId: 'm',
  teamId: 't',
  audience: 'teammate',
  status: 'active',
  displayName: 'Omar',
  nickname: null,
  positions: [],
  jerseyNumber: null,
  division: null,
  hasAvatar: false,
  preferredName: null,
  fullNameAr: null,
  gender: null,
  fullName: null,
  jerseySize: null,
  email: null,
  phone: null,
  heightCm: null,
  weightKg: null,
  ageClassification: null,
  dateOfBirth: null,
  statusReason: null,
  version: null,
};

const full: MemberProfile = {
  ...empty,
  audience: 'admin',
  positions: ['handler'],
  jerseyNumber: 7,
  division: 'open',
  preferredName: 'O',
  gender: 'man',
  fullName: 'Omar Hassan',
  jerseySize: 'L',
  email: 'o@x.com',
  phone: '+20',
  heightCm: 182,
  weightKg: 78,
  ageClassification: 'senior',
  dateOfBirth: '1998-03-14',
};

describe('buildProfileFields', () => {
  it('renders only core fields (with fallbacks) for an empty profile', () => {
    const fields = buildProfileFields(t, empty);
    expect(fields.map((field) => field.key)).toEqual([
      'fullName',
      'nickname',
      'jersey',
      'positions',
    ]);
    expect(fields[0]?.value).toBe('Omar');
  });

  it('renders extended fields only when present', () => {
    const keys = buildProfileFields(t, full).map((field) => field.key);
    expect(keys).toContain('email');
    expect(keys).toContain('height');
    expect(keys).toContain('gender');
  });
});
