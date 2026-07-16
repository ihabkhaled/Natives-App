import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { LoginContainer } from '../containers/login.container';
import { loginPath } from './auth.paths';
import { getAuthRouteDefinitions } from './auth.routes';

describe('getAuthRouteDefinitions', () => {
  it('exposes exactly one route: the login screen', () => {
    const definitions = getAuthRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]!.path).toBe(loginPath());
    expect(definitions[0]!.path).toBe('/login');
  });

  it('matches the login path exactly and keeps it public-only', () => {
    const [login] = getAuthRouteDefinitions();

    expect(login!.exact).toBe(true);
    expect(login!.access).toBe(ROUTE_ACCESS.PublicOnly);
    expect(login!.access).toBe('public-only');
  });

  it('wires the login container as the route component', () => {
    const [login] = getAuthRouteDefinitions();

    expect(login!.component).toBe(LoginContainer);
  });
});
