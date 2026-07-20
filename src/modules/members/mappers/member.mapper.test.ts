import { describe, expect, it } from 'vitest';

import {
  mapAvatarAccess,
  mapMemberAlias,
  mapMemberDirectoryItem,
  mapMemberDirectoryPage,
  mapMemberHistory,
  mapMemberProfile,
  mapMemberRoles,
  mapMemberStatusEvent,
  mapMembershipRecord,
} from './member.mapper';

const ISO = '2026-07-19T10:00:00.000Z';

const directoryItem = {
  membershipId: 'mem-1',
  teamId: 'team-1',
  status: 'active' as const,
  displayName: 'Omar',
  nickname: 'O',
  jerseyNumber: 7,
  positions: ['handler'],
  hasAvatar: true,
};

const memberView = {
  membershipId: 'mem-1',
  teamId: 'team-1',
  audience: 'admin' as const,
  status: 'active' as const,
  displayName: 'Omar',
  nickname: 'O',
  positions: ['handler'],
  jerseyNumber: 7,
  division: 'open',
  hasAvatar: true,
  preferredName: 'Omar',
  fullNameAr: null,
  gender: 'man' as const,
  fullName: 'Omar Hassan',
  jerseySize: 'L',
  email: 'omar@example.com',
  phone: '+20',
  heightCm: 182,
  weightKg: 78,
  ageClassification: 'senior' as const,
  dateOfBirth: '1998-03-14',
  statusReason: null,
  createdBy: 'user-1',
  updatedBy: 'user-1',
  version: 3,
};

describe('member.mapper', () => {
  it('maps a directory item', () => {
    expect(mapMemberDirectoryItem(directoryItem).membershipId).toBe('mem-1');
  });

  it('maps a page and computes hasMore', () => {
    const page = mapMemberDirectoryPage({ items: [directoryItem], total: 5, limit: 20, offset: 0 });
    expect(page).toMatchObject({ pageSize: 20, total: 5, hasMore: true });
    const full = mapMemberDirectoryPage({ items: [directoryItem], total: 1, limit: 20, offset: 0 });
    expect(full.hasMore).toBe(false);
  });

  it('maps an audience-shaped profile', () => {
    expect(mapMemberProfile(memberView)).toMatchObject({
      audience: 'admin',
      email: 'omar@example.com',
    });
  });

  it('maps a membership record', () => {
    const record = mapMembershipRecord({
      id: 'mem-1',
      teamId: 'team-1',
      seasonId: null,
      userId: null,
      status: 'suspended',
      statusReason: 'x',
      statusEffectiveAt: ISO,
      joinedAt: ISO,
      leftAt: null,
      anonymizedAt: null,
      createdBy: null,
      updatedBy: null,
      createdAt: ISO,
      updatedAt: ISO,
      deletedAt: null,
      version: 2,
    });
    expect(record).toMatchObject({ id: 'mem-1', status: 'suspended', version: 2 });
  });

  it('maps history events newest-first as provided', () => {
    const event = {
      id: 'e1',
      membershipId: 'mem-1',
      fromStatus: 'invited' as const,
      toStatus: 'active' as const,
      reason: 'joined',
      actorUserId: 'user-1',
      effectiveAt: ISO,
      occurredAt: ISO,
    };
    expect(mapMemberStatusEvent(event).toStatus).toBe('active');
    expect(mapMemberHistory({ items: [event] })).toHaveLength(1);
  });

  it('maps an alias and roles and avatar access', () => {
    expect(
      mapMemberAlias({
        id: 'a1',
        membershipId: 'mem-1',
        alias: 'O',
        source: 'manual',
        createdAt: ISO,
      }).alias,
    ).toBe('O');
    expect(
      mapMemberRoles({
        membershipId: 'mem-1',
        roles: ['member'],
        assignableRoles: ['member', 'coach'],
      }).assignableRoles,
    ).toEqual(['member', 'coach']);
    expect(mapAvatarAccess({ url: null, expiresAt: null }).url).toBeNull();
    expect(mapAvatarAccess({ url: 'u', expiresAt: ISO }).expiresAtIso).toBe(ISO);
  });
});
