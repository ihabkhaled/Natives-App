import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import {
  assignableRoleCatalogSchema,
  roleAssignmentResponseSchema,
  userAssignmentsResponseSchema,
} from './role-assignments.schema';

const VALID_ASSIGNMENT = {
  id: 'assignment-1',
  userId: 'user-1',
  roleKey: 'COACH',
  teamId: 'team-1',
  seasonId: null,
  effectiveFrom: '2026-07-01T09:00:00.000Z',
  effectiveTo: null,
  grantedBy: 'admin-1',
  revokedAt: null,
  version: 1,
};

describe('roleAssignmentResponseSchema (open role catalog)', () => {
  it('parses a well-formed assignment', () => {
    expect(safeParseWithSchema(roleAssignmentResponseSchema, VALID_ASSIGNMENT).success).toBe(true);
  });

  it('parses a role the client has never heard of', () => {
    // A role seeded on the server after this client shipped must still reach
    // the admin screen: narrowing roleKey to an enum would hide it entirely.
    expect(
      safeParseWithSchema(roleAssignmentResponseSchema, {
        ...VALID_ASSIGNMENT,
        roleKey: 'PHYSIO_LEAD',
      }).success,
    ).toBe(true);
  });

  it('keeps a platform-wide grant distinguishable by its null team', () => {
    const parsed = safeParseWithSchema(roleAssignmentResponseSchema, {
      ...VALID_ASSIGNMENT,
      teamId: null,
    });

    expect(parsed.success && parsed.data.teamId).toBeNull();
  });

  it('rejects an assignment with no id — nothing could be revoked with it', () => {
    expect(
      safeParseWithSchema(roleAssignmentResponseSchema, { ...VALID_ASSIGNMENT, id: '' }).success,
    ).toBe(false);
  });

  it('rejects an unparseable effective-from instant', () => {
    expect(
      safeParseWithSchema(roleAssignmentResponseSchema, {
        ...VALID_ASSIGNMENT,
        effectiveFrom: 'yesterday',
      }).success,
    ).toBe(false);
  });
});

describe('userAssignmentsResponseSchema', () => {
  it('parses a user holding nothing at all', () => {
    expect(
      safeParseWithSchema(userAssignmentsResponseSchema, { userId: 'user-1', assignments: [] })
        .success,
    ).toBe(true);
  });

  it('rejects an envelope missing the user it describes', () => {
    expect(safeParseWithSchema(userAssignmentsResponseSchema, { assignments: [] }).success).toBe(
      false,
    );
  });
});

describe('assignableRoleCatalogSchema', () => {
  it('parses a catalog containing a slug the client does not know', () => {
    expect(
      safeParseWithSchema(assignableRoleCatalogSchema, {
        teamId: 'team-1',
        roles: [{ slug: 'physio_lead', displayName: 'Physio Lead', description: '' }],
      }).success,
    ).toBe(true);
  });

  it('rejects a catalog entry with no slug to send', () => {
    expect(
      safeParseWithSchema(assignableRoleCatalogSchema, {
        teamId: 'team-1',
        roles: [{ slug: '', displayName: 'x', description: 'y' }],
      }).success,
    ).toBe(false);
  });
});
