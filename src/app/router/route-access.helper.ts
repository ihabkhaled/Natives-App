import { ROUTE_ACCESS, type RouteAccess } from '@/shared/types';

import { GUARD_STATUS, type GuardStatus } from './guard.constants';

/**
 * Everything a guard needs to decide access, reduced to booleans so the
 * decision stays a pure, exhaustively-testable function.
 */
export interface RouteAccessInput {
  readonly access: RouteAccess;
  readonly isSessionResolved: boolean;
  readonly isAuthenticated: boolean;
  readonly isProfileReady: boolean;
  readonly isProfileErrored: boolean;
  readonly featureEnabled: boolean;
  readonly accountActive: boolean;
  readonly onboardingComplete: boolean;
  readonly requiresTeamContext: boolean;
  readonly hasTeamContext: boolean;
  readonly hasRequiredPermissions: boolean;
}

interface AccessRule {
  readonly when: (input: RouteAccessInput) => boolean;
  readonly status: GuardStatus;
}

/**
 * Ordered decision table. The first matching rule wins; falling through to
 * the end means every condition is satisfied and the screen may render.
 */
const ACCESS_RULES: readonly AccessRule[] = [
  { when: (i) => !i.isSessionResolved, status: GUARD_STATUS.Loading },
  {
    when: (i) => i.access === ROUTE_ACCESS.PublicOnly && i.isAuthenticated,
    status: GUARD_STATUS.RedirectHome,
  },
  { when: (i) => i.access === ROUTE_ACCESS.PublicOnly, status: GUARD_STATUS.Allow },
  { when: (i) => i.access === ROUTE_ACCESS.Public, status: GUARD_STATUS.Allow },
  { when: (i) => !i.isAuthenticated, status: GUARD_STATUS.RedirectLogin },
  { when: (i) => i.isProfileErrored, status: GUARD_STATUS.RedirectLogin },
  { when: (i) => !i.isProfileReady, status: GUARD_STATUS.Loading },
  { when: (i) => !i.featureEnabled, status: GUARD_STATUS.RedirectHome },
  { when: (i) => !i.accountActive, status: GUARD_STATUS.AccountBlocked },
  { when: (i) => !i.onboardingComplete, status: GUARD_STATUS.Onboarding },
  { when: (i) => i.requiresTeamContext && !i.hasTeamContext, status: GUARD_STATUS.NoTeam },
  { when: (i) => !i.hasRequiredPermissions, status: GUARD_STATUS.Forbidden },
];

/** Resolve a route's guard outcome from its access policy and session state. */
export function resolveRouteAccess(input: RouteAccessInput): GuardStatus {
  const matched = ACCESS_RULES.find((rule) => rule.when(input));
  return matched === undefined ? GUARD_STATUS.Allow : matched.status;
}
