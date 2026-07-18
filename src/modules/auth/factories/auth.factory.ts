import { PERMISSIONS } from '@/shared/security';

import { ACCOUNT_STATE, type AuthMembership, type AuthUser } from '../types/auth.types';

const DEFAULT_MEMBERSHIP: AuthMembership = {
  teamId: 'team-natives',
  teamName: 'Cairo Natives',
  seasonId: 'season-2026-spring',
  seasonName: 'Spring 2026',
};

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
