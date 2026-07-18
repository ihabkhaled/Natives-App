import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { GUARD_STATUS } from './guard.constants';
import { resolveRouteAccess, type RouteAccessInput } from './route-access.helper';

/** A fully-satisfied protected route: every rule falls through to allow. */
function allowInput(overrides: Partial<RouteAccessInput> = {}): RouteAccessInput {
  return {
    access: ROUTE_ACCESS.Protected,
    isSessionResolved: true,
    isAuthenticated: true,
    isProfileReady: true,
    isProfileErrored: false,
    featureEnabled: true,
    accountActive: true,
    onboardingComplete: true,
    requiresTeamContext: false,
    hasTeamContext: false,
    hasRequiredPermissions: true,
    ...overrides,
  };
}

describe('resolveRouteAccess', () => {
  it('holds every route while the session is still unknown', () => {
    expect(resolveRouteAccess(allowInput({ isSessionResolved: false }))).toBe(GUARD_STATUS.Loading);
  });

  it('sends an authenticated user away from a public-only route', () => {
    expect(
      resolveRouteAccess(allowInput({ access: ROUTE_ACCESS.PublicOnly, isAuthenticated: true })),
    ).toBe(GUARD_STATUS.RedirectHome);
  });

  it('lets an anonymous visitor onto a public-only route', () => {
    expect(
      resolveRouteAccess(allowInput({ access: ROUTE_ACCESS.PublicOnly, isAuthenticated: false })),
    ).toBe(GUARD_STATUS.Allow);
  });

  it('lets anyone onto a public route', () => {
    expect(
      resolveRouteAccess(allowInput({ access: ROUTE_ACCESS.Public, isAuthenticated: false })),
    ).toBe(GUARD_STATUS.Allow);
  });

  it('redirects an anonymous visitor from a protected route to login', () => {
    expect(resolveRouteAccess(allowInput({ isAuthenticated: false }))).toBe(
      GUARD_STATUS.RedirectLogin,
    );
  });

  it('redirects to login when the profile fetch errored', () => {
    expect(resolveRouteAccess(allowInput({ isProfileErrored: true }))).toBe(
      GUARD_STATUS.RedirectLogin,
    );
  });

  it('waits without flashing while the authenticated profile loads', () => {
    expect(resolveRouteAccess(allowInput({ isProfileReady: false }))).toBe(GUARD_STATUS.Loading);
  });

  it('treats a flagged-off route as unavailable and redirects home', () => {
    expect(resolveRouteAccess(allowInput({ featureEnabled: false }))).toBe(
      GUARD_STATUS.RedirectHome,
    );
  });

  it('blocks an inactive account', () => {
    expect(resolveRouteAccess(allowInput({ accountActive: false }))).toBe(
      GUARD_STATUS.AccountBlocked,
    );
  });

  it('routes an unfinished onboarding to the onboarding state', () => {
    expect(resolveRouteAccess(allowInput({ onboardingComplete: false }))).toBe(
      GUARD_STATUS.Onboarding,
    );
  });

  it('requires an explicit team context when the route demands one', () => {
    expect(
      resolveRouteAccess(allowInput({ requiresTeamContext: true, hasTeamContext: false })),
    ).toBe(GUARD_STATUS.NoTeam);
  });

  it('forbids a route when a required permission is missing even with team context', () => {
    expect(
      resolveRouteAccess(
        allowInput({
          requiresTeamContext: true,
          hasTeamContext: true,
          hasRequiredPermissions: false,
        }),
      ),
    ).toBe(GUARD_STATUS.Forbidden);
  });

  it('allows a fully-satisfied protected route', () => {
    expect(resolveRouteAccess(allowInput())).toBe(GUARD_STATUS.Allow);
  });
});
