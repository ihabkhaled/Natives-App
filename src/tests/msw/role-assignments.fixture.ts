import type { AssignableRole, RoleAssignment } from '@/modules/role-assignments';

/** The user whose assignments the mock roster describes. */
export const MOCK_ASSIGNMENT_USER_ID = 'user-1';

/**
 * One user's assignments as the admin screen meets them: a team-scoped role
 * that can be revoked here, a season-scoped one, a platform-wide grant that
 * deliberately CANNOT be revoked here (it belongs to the audited super-admin
 * flow), and an already-revoked row so the historical path is exercised.
 */
export const MOCK_ROLE_ASSIGNMENTS: readonly RoleAssignment[] = [
  {
    id: 'assignment-1',
    userId: MOCK_ASSIGNMENT_USER_ID,
    roleKey: 'COACH',
    teamId: 'team-1',
    seasonId: null,
    effectiveFrom: '2026-07-01T09:00:00.000Z',
    effectiveTo: null,
    grantedBy: 'admin-1',
    revokedAt: null,
    version: 1,
  },
  {
    id: 'assignment-2',
    userId: MOCK_ASSIGNMENT_USER_ID,
    roleKey: 'SCOREKEEPER',
    teamId: 'team-1',
    seasonId: 'season-2026',
    effectiveFrom: '2026-08-01T09:00:00.000Z',
    effectiveTo: null,
    grantedBy: null,
    revokedAt: null,
    version: 1,
  },
  {
    id: 'assignment-3',
    userId: MOCK_ASSIGNMENT_USER_ID,
    roleKey: 'SUPER_ADMIN',
    teamId: null,
    seasonId: null,
    effectiveFrom: '2026-01-01T09:00:00.000Z',
    effectiveTo: null,
    grantedBy: null,
    revokedAt: null,
    version: 2,
  },
  {
    id: 'assignment-4',
    userId: MOCK_ASSIGNMENT_USER_ID,
    roleKey: 'ANALYST',
    teamId: 'team-1',
    seasonId: null,
    effectiveFrom: '2026-02-01T09:00:00.000Z',
    effectiveTo: '2026-03-01T09:00:00.000Z',
    grantedBy: 'admin-1',
    revokedAt: '2026-03-01T09:00:00.000Z',
    version: 3,
  },
];

/**
 * The catalog the server returns for an actor below the platform ceiling.
 * SUPER_ADMIN is absent on purpose: the endpoint never offers a role above the
 * caller's own level, which is exactly what the grant form relies on.
 */
export const MOCK_ASSIGNABLE_ROLES: readonly AssignableRole[] = [
  { slug: 'member', displayName: 'Member', description: 'Baseline team access.' },
  { slug: 'coach', displayName: 'Coach', description: 'Runs practices and assessments.' },
  { slug: 'scorekeeper', displayName: 'Scorekeeper', description: 'Records match scores.' },
];
