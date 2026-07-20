import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS, type AppRouteDefinition, type RouteMeta } from '@/shared/types';

import { selectRouteTitleKey } from './app-bar-title.helper';

function Screen(): null {
  return null;
}

function route(path: string, titleKey: string | null): AppRouteDefinition {
  const meta: RouteMeta = {
    key: path,
    titleKey: titleKey as RouteMeta['titleKey'],
    permissions: [],
    requiresTeamContext: false,
    offline: false,
    preload: false,
    featureFlag: null,
    nav: null,
  };
  const base: AppRouteDefinition = {
    path,
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: Screen,
  };
  return titleKey === null ? base : { ...base, meta };
}

const ROUTES = [
  route('/home', 'home.title'),
  route('/practices', 'practice.calendarTitle'),
  route('/practices/:sessionId', 'practice.detailsTitle'),
  route('/no-meta', null),
];

describe('selectRouteTitleKey', () => {
  it('prefers an exact path match', () => {
    expect(selectRouteTitleKey(ROUTES, '/practices')).toBe('practice.calendarTitle');
  });

  it('falls back to a parameterised pattern', () => {
    expect(selectRouteTitleKey(ROUTES, '/practices/sess-1')).toBe('practice.detailsTitle');
  });

  it('returns null for a location with no routed metadata', () => {
    expect(selectRouteTitleKey(ROUTES, '/no-meta')).toBeNull();
  });

  it('returns null when nothing matches the location', () => {
    expect(selectRouteTitleKey(ROUTES, '/nowhere')).toBeNull();
  });

  it('never matches a pattern with a different segment count', () => {
    expect(selectRouteTitleKey(ROUTES, '/practices/sess-1/attendance')).toBeNull();
  });

  it('rejects a literal segment that differs from the location', () => {
    expect(selectRouteTitleKey([route('/teams/:id', 'home.title')], '/squads/1')).toBeNull();
  });
});
