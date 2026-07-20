import type { SchemaOutput } from '@/packages/schema';
import { PERMISSIONS } from '@/shared/security';

import type { authMembershipDtoSchema } from '../schemas/auth.schema';
import { ACCOUNT_STATE, type AuthMembership, type AuthUser } from '../types/auth.types';

/** Wire-shaped membership: assignable both to the DTO slot and to the domain. */
type AuthMembershipDto = SchemaOutput<typeof authMembershipDtoSchema>;

/**
 * Deterministic membership scope. Overrides let a test express a seasonless
 * team (`seasonId: null`) or a non-active lifecycle without restating the
 * whole `AuthMembershipDto` shape.
 */
export function buildAuthMembership(overrides: Partial<AuthMembershipDto> = {}): AuthMembershipDto {
  return {
    membershipId: 'membership-natives-1',
    teamId: 'team-natives',
    teamSlug: 'cairo-natives',
    teamName: 'Cairo Natives',
    seasonId: 'season-2026-spring',
    seasonSlug: 'spring-2026',
    seasonName: 'Spring 2026',
    status: 'active',
    roles: ['member'],
    ...overrides,
  };
}

const DEFAULT_MEMBERSHIP: AuthMembership = buildAuthMembership();

/** Deterministic builders shared by MSW handlers and tests. */
export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    email: 'ranger@example.com',
    displayName: 'Ranger One',
    permissions: Object.values(PERMISSIONS),
    accountState: ACCOUNT_STATE.Active,
    onboardingComplete: true,
    memberships: [DEFAULT_MEMBERSHIP],
    ...overrides,
  };
}
