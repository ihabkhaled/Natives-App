import type { MemberProfile } from '@/modules/members';

/** A fully-populated app-domain member profile for hook and helper tests. */
export function buildMemberProfile(overrides: Partial<MemberProfile> = {}): MemberProfile {
  return {
    membershipId: 'mem-1',
    teamId: 'team-1',
    audience: 'self',
    status: 'active',
    displayName: 'Omar Hassan',
    nickname: 'Omo',
    positions: ['handler'],
    jerseyNumber: 7,
    division: 'open',
    hasAvatar: false,
    preferredName: 'Omar',
    fullNameAr: null,
    gender: 'man',
    fullName: 'Omar Hassan',
    jerseySize: 'L',
    email: 'omar@example.com',
    phone: '+20',
    heightCm: 182,
    weightKg: 78,
    ageClassification: 'senior',
    dateOfBirth: '1998-03-14',
    statusReason: null,
    version: 2,
    ...overrides,
  };
}
