import { describe, expect, it } from 'vitest';

import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { AboutContainer } from '../containers/about.container';
import { HomeContainer } from '../containers/home.container';
import { LandingContainer } from '../containers/landing.container';
import { NotFoundContainer } from '../containers/not-found.container';
import { WelcomeContainer } from '../containers/welcome.container';
import {
  aboutPath,
  achievementsPath,
  galleryPath,
  homePath,
  locationPath,
  rootPath,
  spiritPath,
  ultimatePath,
  welcomePath,
} from './home.paths';
import { getHomeRouteDefinitions, getNotFoundRouteDefinition } from './home.routes';

describe('getHomeRouteDefinitions', () => {
  it('exposes the landing, welcome, about, the standalone subject pages, and home, in that order', () => {
    const definitions = getHomeRouteDefinitions();

    expect(definitions).toHaveLength(9);
    expect(definitions.map((definition) => definition.path)).toEqual([
      rootPath(),
      welcomePath(),
      aboutPath(),
      ultimatePath(),
      spiritPath(),
      galleryPath(),
      locationPath(),
      achievementsPath(),
      homePath(),
    ]);
  });

  it('keeps every standalone subject page public, exact, and unauthenticated-readable', () => {
    const definitions = getHomeRouteDefinitions();
    const subjectPaths = [
      ultimatePath(),
      spiritPath(),
      galleryPath(),
      locationPath(),
      achievementsPath(),
    ];

    for (const path of subjectPaths) {
      const route = definitions.find((definition) => definition.path === path);
      expect(route?.exact).toBe(true);
      expect(route?.access).toBe(ROUTE_ACCESS.Public);
    }
  });

  it('keeps the landing page public for signed-in and signed-out visitors alike', () => {
    const [landing] = getHomeRouteDefinitions();

    expect(landing!.path).toBe('/');
    expect(landing!.exact).toBe(true);
    expect(landing!.access).toBe(ROUTE_ACCESS.Public);
    expect(landing!.component).toBe(LandingContainer);
  });

  it('keeps the welcome screen signed-out-only and exactly matched', () => {
    const [, welcome] = getHomeRouteDefinitions();

    expect(welcome!.path).toBe('/welcome');
    expect(welcome!.exact).toBe(true);
    // The landing page at `/` is the marketing front door; welcome stays a
    // lightweight signed-out entry (sign-in CTA) so old deep links still work.
    expect(welcome!.access).toBe(ROUTE_ACCESS.PublicOnly);
    expect(welcome!.component).toBe(WelcomeContainer);
  });

  it('keeps the about screen public for signed-in and signed-out visitors alike', () => {
    const [, , about] = getHomeRouteDefinitions();

    expect(about!.path).toBe('/about');
    expect(about!.exact).toBe(true);
    expect(about!.access).toBe(ROUTE_ACCESS.Public);
    expect(about!.component).toBe(AboutContainer);
  });

  it('protects the home screen behind a session', () => {
    const home = getHomeRouteDefinitions().find((definition) => definition.path === homePath());

    expect(home!.path).toBe('/home');
    expect(home!.exact).toBe(true);
    expect(home!.access).toBe(ROUTE_ACCESS.Protected);
    expect(home!.component).toBe(HomeContainer);
  });

  it('is a permission-free primary navigation destination', () => {
    const home = getHomeRouteDefinitions().find((definition) => definition.path === homePath());

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
