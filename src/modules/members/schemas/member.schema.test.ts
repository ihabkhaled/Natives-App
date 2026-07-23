import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import {
  assignableRolesResponseSchema,
  invitationDeliveryResponseSchema,
  memberRolesResponseSchema,
} from './member.schema';

describe('memberRolesResponseSchema (open catalog)', () => {
  const valid = {
    membershipId: 'm-1',
    roles: ['coach'],
    assignableRoles: ['member', 'coach'],
  };

  it('parses a client-unknown slug — a new server role must not break parsing', () => {
    expect(
      safeParseWithSchema(memberRolesResponseSchema, {
        ...valid,
        roles: ['physio'],
        assignableRoles: ['physio_lead', 'member'],
      }).success,
    ).toBe(true);
  });

  it('rejects a malformed slug shape', () => {
    expect(
      safeParseWithSchema(memberRolesResponseSchema, { ...valid, roles: ['Coach!'] }).success,
    ).toBe(false);
    expect(safeParseWithSchema(memberRolesResponseSchema, { ...valid, roles: [''] }).success).toBe(
      false,
    );
    expect(
      safeParseWithSchema(memberRolesResponseSchema, { ...valid, roles: ['a'.repeat(65)] }).success,
    ).toBe(false);
  });
});

describe('invitationDeliveryResponseSchema', () => {
  const valid = {
    id: 'inv-1',
    email: 'omar@example.com',
    role: 'user',
    status: 'pending',
    teamId: 'team-1',
    teamRole: 'coach',
    expiresAt: '2026-07-28T00:00:00.000Z',
    createdAt: '2026-07-21T00:00:00.000Z',
    token: 'one-time-token',
  };

  it('parses the team-scoped delivery including a null platform teamId', () => {
    expect(safeParseWithSchema(invitationDeliveryResponseSchema, valid).success).toBe(true);
    expect(
      safeParseWithSchema(invitationDeliveryResponseSchema, { ...valid, teamId: null }).success,
    ).toBe(true);
  });

  it('rejects a missing granted team role', () => {
    const { teamRole: _dropped, ...withoutRole } = valid;
    expect(safeParseWithSchema(invitationDeliveryResponseSchema, withoutRole).success).toBe(false);
  });
});

describe('assignableRolesResponseSchema', () => {
  it('parses the server catalog with display metadata, unknown slugs included', () => {
    expect(
      safeParseWithSchema(assignableRolesResponseSchema, {
        teamId: 'team-1',
        roles: [
          { slug: 'coach', displayName: 'Coach', description: 'Runs practices.' },
          { slug: 'physio', displayName: 'Physiotherapist', description: '' },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejects an entry with a malformed slug', () => {
    expect(
      safeParseWithSchema(assignableRolesResponseSchema, {
        teamId: 'team-1',
        roles: [{ slug: 'Not A Slug', displayName: 'x', description: 'y' }],
      }).success,
    ).toBe(false);
  });
});
