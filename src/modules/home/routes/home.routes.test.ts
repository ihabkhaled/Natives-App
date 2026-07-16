import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

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

  it('keeps the welcome screen public and exactly matched', () => {
    const [welcome] = getHomeRouteDefinitions();

    expect(welcome!.path).toBe('/welcome');
    expect(welcome!.exact).toBe(true);
    expect(welcome!.access).toBe(ROUTE_ACCESS.Public);
    expect(welcome!.component).toBe(WelcomeContainer);
  });

  it('protects the home screen behind a session', () => {
    const [, home] = getHomeRouteDefinitions();

    expect(home!.path).toBe('/home');
    expect(home!.exact).toBe(true);
    expect(home!.access).toBe(ROUTE_ACCESS.Protected);
    expect(home!.component).toBe(HomeContainer);
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
