import { describe, expect, it } from 'vitest';

import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { HomeContainer } from '../containers/home.container';
import { NotFoundContainer } from '../containers/not-found.container';
import { WelcomeContainer } from '../containers/welcome.container';
import { homePath, welcomePath } from './home.paths';
import { getHomeRouteDefinitions, getNotFoundRouteDefinition } from './home.routes';

describe('getHomeRouteDefinitions', () => {
  it('exposes the welcome and home routes, in that order', () => {
    const definitions = getHomeRouteDefinitions();

    expect(definitions).toHaveLength(2);
    expect(definitions.map((definition) => definition.path)).toEqual([welcomePath(), homePath()]);
  });

  it('keeps the welcome screen signed-out-only and exactly matched', () => {
    const [welcome] = getHomeRouteDefinitions();

    expect(welcome!.path).toBe('/welcome');
    expect(welcome!.exact).toBe(true);
    // `/` redirects to `/welcome`, so a Public welcome screen showed an
    // authenticated visitor the marketing page and a dead "Sign in" CTA.
    expect(welcome!.access).toBe(ROUTE_ACCESS.PublicOnly);
    expect(welcome!.component).toBe(WelcomeContainer);
  });

  it('protects the home screen behind a session', () => {
    const [, home] = getHomeRouteDefinitions();

    expect(home!.path).toBe('/home');
    expect(home!.exact).toBe(true);
    expect(home!.access).toBe(ROUTE_ACCESS.Protected);
    expect(home!.component).toBe(HomeContainer);
  });

  it('is a permission-free primary navigation destination', () => {
    const [, home] = getHomeRouteDefinitions();

    expect(home!.meta?.permissions).toEqual([]);
    expect(home!.meta?.nav).toEqual({
      order: 0,
      group: NAV_GROUP.Overview,
      iconName: 'home',
      labelKey: 'nav.home',
    });
  });

  it('never includes the catch-all, which the app router appends last', () => {
    expect(getHomeRouteDefinitions().map((definition) => definition.path)).not.toContain('*');
  });
});

describe('getNotFoundRouteDefinition', () => {
  it('matches every unclaimed path', () => {
    expect(getNotFoundRouteDefinition().path).toBe('*');
    expect(getNotFoundRouteDefinition().exact).toBe(false);
  });

  it('stays public so a 404 never bounces through the login screen', () => {
    expect(getNotFoundRouteDefinition().access).toBe(ROUTE_ACCESS.Public);
  });

  it('wires the not-found container as the route component', () => {
    expect(getNotFoundRouteDefinition().component).toBe(NotFoundContainer);
  });
});
